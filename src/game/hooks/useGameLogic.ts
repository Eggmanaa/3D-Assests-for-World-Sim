import { useState, useEffect } from 'react';
import { generateMap, TIMELINE_EVENTS, GENERATE_NEIGHBORS } from '../../../constants';
import { TileData, BuildingType, GameState, CivPreset, WATER_CAPACITIES, NeighborCiv, StatKey, TerrainType, WonderDefinition, BUILDING_COSTS } from '../../../types';
import { calculateStats } from '../utils/gameHelpers';
import { processTimelineEvent } from '../utils/timelineEngine';

interface UseGameLogicProps {
    initialGameState?: GameState;
    onGameStateChange?: (gameState: GameState) => void;
}

export const useGameLogic = ({ initialGameState, onGameStateChange }: UseGameLogicProps) => {
    // --- STATE ---
    const [tiles, setTiles] = useState<TileData[]>([]);
    const [activeTab, setActiveTab] = useState<'build' | 'wonders' | 'religion' | 'war'>('build');
    const [gameState, setGameState] = useState<GameState>(initialGameState || {
        simulationId: 'demo',
        year: -50000,
        timelineIndex: 0,
        hasStarted: false,
        civilization: null as any,
        selectedAction: null,
        placingWonder: false,
        messages: [],
        neighbors: [],
        pendingTurnChoice: false,
        currentEventPopup: null,
        gameFlags: { warUnlocked: false, religionUnlocked: false }
    });

    // Notify parent of state changes
    useEffect(() => {
        if (onGameStateChange) {
            onGameStateChange(gameState);
        }
    }, [gameState, onGameStateChange]);

    // Temporary storage for the active turn bonus
    const [turnBonus, setTurnBonus] = useState<any>({});

    // --- ACTIONS ---

    const addMessage = (msg: string) => {
        setGameState(prev => ({
            ...prev,
            messages: [msg, ...prev.messages.slice(0, 4)]
        }));
    };

    const startGame = (preset: CivPreset) => {
        const newTiles = generateMap(preset);

        setTiles(newTiles);
        setGameState({
            simulationId: 'sim-1',
            year: -50000,
            timelineIndex: 0,
            hasStarted: true,
            selectedAction: null,
            placingWonder: false,
            pendingTurnChoice: false,
            currentEventPopup: null,
            messages: [`Welcome to ${preset.name}. The year is 50,000 BCE.`],
            neighbors: GENERATE_NEIGHBORS(-50000),
            gameFlags: { warUnlocked: false, religionUnlocked: false },
            civilization: {
                presetId: preset.id,
                name: preset.name,
                regions: preset.regions,
                culturalStage: 'Barbarism',
                traits: preset.traits,
                baseStats: preset.baseStats,
                flags: {
                    conquered: false,
                    religionFound: false,
                    housesSupportTwoPop: false,
                    israelBonus: false,
                    troyWallDouble: false,
                    romanSplit: false,
                    alexandrianBonus: false,
                    chinaWallDiscount: false
                },
                builtWonderId: null,
                religion: { name: null, tenets: [] },
                buildings: { temples: 0, walls: 0, amphitheatres: 0, archimedes_towers: 0 },
                stats: {
                    houses: 0,
                    housesBuiltThisTurn: 0,
                    population: 0,
                    capacity: WATER_CAPACITIES[preset.waterResource],
                    fertility: preset.baseStats.fertility,
                    industry: preset.baseStats.industry,
                    industryLeft: preset.baseStats.industry,
                    martial: preset.baseStats.martial,
                    defense: preset.baseStats.defense,
                    science: 0,
                    culture: 0,
                    faith: preset.baseStats.faith,
                    diplomacy: 0
                }
            }
        });
    };

    // Triggered by clicking "Advance Timeline"
    const initiateAdvance = () => {
        setGameState(prev => ({ ...prev, pendingTurnChoice: true }));
    };

    const closeEventPopup = () => {
        setGameState(prev => ({ ...prev, currentEventPopup: null }));
    };

    // Triggered by making a choice in the modal
    const finalizeAdvance = (choice: string) => {
        const bonus = { [choice]: true };
        setTurnBonus(bonus);

        const nextIndex = gameState.timelineIndex + 1;
        if (nextIndex >= TIMELINE_EVENTS.length) return;

        const event = TIMELINE_EVENTS[nextIndex];

        // 1. Calculate Base Stats for this Turn
        const currentStats = calculateStats(tiles, gameState.civilization, bonus, gameState.neighbors);

        // 2. Apply Event Logic
        const eventResult = processTimelineEvent(event, { ...gameState.civilization, stats: { ...gameState.civilization.stats, ...currentStats } }, gameState.gameFlags, gameState.neighbors);

        // 3. Update House Count (Disasters only, Growth is Manual)
        let newHouses = gameState.civilization.stats.houses;

        // Apply disaster losses
        newHouses = Math.max(0, newHouses - eventResult.housesLost);

        // Pop Calculation
        const popMultiplier = (eventResult.newFlags.housesSupportTwoPop || event.year >= -480) ? 2 : 1;
        let newPop = newHouses * popMultiplier;

        // Handle explicit pop set (e.g. Thera)
        if (eventResult.changes.houses !== undefined) newHouses = eventResult.changes.houses;
        if (eventResult.changes.population !== undefined) newPop = eventResult.changes.population;

        // 4. Stat merging (Event mods + Calculated mods)
        const mergedStats = {
            ...currentStats,
            ...eventResult.changes,
            houses: newHouses,
            housesBuiltThisTurn: 0, // Reset construction limit for new turn
            population: newPop,
            industryLeft: currentStats.industry, // Reset industry
        };

        // Assyrian Decline Special Logic (Halve All Stats) - applied after merge if needed
        if (event.year === -560 && gameState.civilization.name.includes('Assyria')) {
            const statsToHalve: StatKey[] = ['martial', 'defense', 'faith', 'industry', 'science', 'culture', 'capacity'];
            statsToHalve.forEach(key => {
                if (key === 'capacity') mergedStats.capacity = Math.floor(mergedStats.capacity / 2);
                else (mergedStats as any)[key] = Math.floor(((mergedStats as any)[key] || 0) / 2);
            });
        }

        // Unlock Cultural Stages
        let stage = gameState.civilization.culturalStage;
        if (mergedStats.culture > 20 && stage === 'Barbarism') stage = 'Classical';
        if (mergedStats.culture > 50 && stage === 'Classical') stage = 'Imperial';

        setGameState(prev => ({
            ...prev,
            year: event.year,
            timelineIndex: nextIndex,
            pendingTurnChoice: false,
            currentEventPopup: {
                year: event.year,
                name: event.name,
                description: event.desc,
                effects: eventResult.messages
            },
            neighbors: [...prev.neighbors, ...eventResult.neighborsToAdd],
            messages: [`Focus: ${choice.toUpperCase()}.`, ...eventResult.messages, `TIMELINE ADVANCED: ${event.name}`, ...prev.messages],
            gameFlags: eventResult.newGameFlags,
            civilization: {
                ...prev.civilization,
                culturalStage: stage,
                flags: eventResult.newFlags,
                stats: {
                    ...prev.civilization.stats,
                    ...mergedStats
                }
            }
        }));
    };

    const handleTileClick = (tileId: string) => {
        const { selectedAction, civilization, placingWonder } = gameState;

        // Handle Wonder Placement
        if (placingWonder && civilization.builtWonderId) {
            const tileIndex = tiles.findIndex(t => t.id === tileId);
            if (tileIndex === -1) return;
            const tile = tiles[tileIndex];

            if (tile.building !== BuildingType.None || [TerrainType.Ocean, TerrainType.Mountain, TerrainType.HighMountain].includes(tile.terrain)) {
                addMessage("Cannot place Wonder here.");
                return;
            }

            const newTiles = [...tiles];
            newTiles[tileIndex] = { ...tile, building: BuildingType.Wonder };
            setTiles(newTiles);
            setGameState(prev => ({ ...prev, placingWonder: false, messages: ["Wonder placed successfully!", ...prev.messages] }));
            return;
        }

        if (!selectedAction) return;

        const tileIndex = tiles.findIndex(t => t.id === tileId);
        if (tileIndex === -1) return;
        const tile = tiles[tileIndex];

        if (tile.building !== BuildingType.None) {
            addMessage("Tile is occupied.");
            return;
        }

        const restrictedForBuildings = [TerrainType.Mountain, TerrainType.HighMountain, TerrainType.Ocean, TerrainType.River, TerrainType.Marsh];

        if (selectedAction === BuildingType.House) {
            // --- HOUSE PLACEMENT LOGIC ---

            // 1. Check Terrain
            if (restrictedForBuildings.includes(tile.terrain) && tile.terrain !== TerrainType.Plains && tile.terrain !== TerrainType.Grassland) {
                addMessage("Cannot build houses on this terrain.");
                return;
            }

            // 2. Check Population Capacity
            if (civilization.stats.houses >= civilization.stats.capacity) {
                addMessage("Population capacity reached.");
                return;
            }

            // 3. Check Fertility Limit (Growth per Turn)
            if (civilization.stats.housesBuiltThisTurn >= civilization.stats.fertility) {
                addMessage(`Growth Limit Reached! (Fertility: ${civilization.stats.fertility})`);
                return;
            }

        } else {
            // --- OTHER STRUCTURE LOGIC ---
            let cost = BUILDING_COSTS[selectedAction];

            // China Great Wall Discount
            if (selectedAction === BuildingType.Wonder && civilization.flags.chinaWallDiscount && civilization.builtWonderId === 'wall') {
                // Handled in buildWonder usually, but just in case of direct costs
            }

            if (civilization.stats.industryLeft < cost) {
                addMessage(`Not enough Industry. Need ${cost}.`);
                return;
            }
            if (selectedAction === BuildingType.ArchimedesTower && civilization.stats.science < 30) {
                addMessage("Requires 30 Science.");
                return;
            }
            if (restrictedForBuildings.includes(tile.terrain)) {
                addMessage("Cannot build structure here.");
                return;
            }
        }

        // Apply Changes
        const newTiles = [...tiles];
        newTiles[tileIndex] = { ...tile, building: selectedAction };
        setTiles(newTiles);

        setGameState(prev => {
            const civ = prev.civilization;
            const cost = BUILDING_COSTS[selectedAction];

            let newHouses = civ.stats.houses;
            let newIndustry = civ.stats.industryLeft;
            let newHousesBuilt = civ.stats.housesBuiltThisTurn;
            const newBuildings = { ...civ.buildings };

            if (selectedAction === BuildingType.House) {
                newHouses += 1;
                newHousesBuilt += 1;
            } else {
                newIndustry -= cost;
                if (selectedAction === BuildingType.Temple) newBuildings.temples++;
                if (selectedAction === BuildingType.Wall) newBuildings.walls++;
                if (selectedAction === BuildingType.Amphitheatre) newBuildings.amphitheatres++;
                if (selectedAction === BuildingType.ArchimedesTower) newBuildings.archimedes_towers++;
            }

            return {
                ...prev,
                selectedAction: null,
                civilization: {
                    ...civ,
                    buildings: newBuildings,
                    stats: {
                        ...civ.stats,
                        houses: newHouses,
                        housesBuiltThisTurn: newHousesBuilt,
                        industryLeft: newIndustry
                    }
                },
                messages: [`Constructed ${selectedAction}`, ...prev.messages]
            }
        });
    };

    const buildWonder = (wonder: WonderDefinition) => {
        const { civilization } = gameState;

        let cost = wonder.cost;
        // China Discount
        if (wonder.id === 'wall' && civilization.flags.chinaWallDiscount) {
            cost = Math.floor(cost / 2);
        }

        if (civilization.builtWonderId) {
            addMessage("You can only build one Wonder.");
            return;
        }
        if (civilization.stats.industryLeft < cost) {
            addMessage("Not enough Industry.");
            return;
        }
        if (gameState.year < wonder.minYear) {
            addMessage("Not available in this era.");
            return;
        }

        setGameState(prev => ({
            ...prev,
            placingWonder: true,
            civilization: {
                ...prev.civilization,
                builtWonderId: wonder.id,
                stats: {
                    ...prev.civilization.stats,
                    industryLeft: prev.civilization.stats.industryLeft - cost
                }
            },
            messages: [`Built Wonder: ${wonder.name}! Now PLACE it on the map.`, ...prev.messages]
        }));
    };

    const foundReligion = (tenetId: string, name: string) => {
        const { civilization, gameFlags } = gameState;

        if (civilization.flags.religionFound) return;
        if (!gameFlags.religionUnlocked && gameState.year < -1000) { addMessage("Too early for organized religion (Wait for 1000 BCE)."); return; }
        if (civilization.buildings.temples < 1) { addMessage("Must build a Temple first."); return; }
        if (civilization.stats.faith < 10) { addMessage("Need 10 Faith."); return; }

        setGameState(prev => {
            const newTenets = [...prev.civilization.religion.tenets, tenetId];
            const isIsrael = prev.civilization.flags.israelBonus;
            const doneFounding = !isIsrael || newTenets.length >= 3; // Israel gets 3

            const msgs = [`Picked Tenet: ${tenetId}`];
            if (doneFounding) msgs.unshift(`Religion Established: ${name}!`);
            else msgs.unshift("Israel Bonus: Pick another tenet.");

            return {
                ...prev,
                civilization: {
                    ...prev.civilization,
                    flags: { ...prev.civilization.flags, religionFound: doneFounding },
                    religion: { name, tenets: newTenets },
                    stats: { ...prev.civilization.stats, faith: prev.civilization.stats.faith + 5 }
                },
                messages: [...msgs, ...prev.messages]
            }
        });
    };

    const spreadReligion = (neighborId: string) => {
        const neighbor = gameState.neighbors.find(n => n.id === neighborId);
        if (!neighbor) return;

        if (gameState.civilization.stats.faith > neighbor.faith + 2) {
            setGameState(prev => ({
                ...prev,
                neighbors: prev.neighbors.map(n => n.id === neighborId ? { ...n, religion: prev.civilization.religion.name || 'Our Faith' } : n),
                messages: [`Spread religion to ${neighbor.name}! They now follow your faith.`, ...prev.messages]
            }));
        } else {
            addMessage(`Failed to convert ${neighbor.name} (Their Faith: ${neighbor.faith} vs Your Faith: ${gameState.civilization.stats.faith})`);
        }
    };

    const formAlliance = (neighborId: string) => {
        const { civilization } = gameState;
        if (civilization.stats.diplomacy < 1) {
            addMessage("Need at least 1 Diplomacy to form alliances.");
            return;
        }

        setGameState(prev => ({
            ...prev,
            neighbors: prev.neighbors.map(n => n.id === neighborId ? { ...n, relationship: 'Ally' } : n),
            messages: [`Formed alliance with ${prev.neighbors.find(n => n.id === neighborId)?.name}!`, ...prev.messages]
        }));
    };

    const attackNeighbor = (neighborId: string) => {
        const { gameFlags } = gameState;
        if (!gameFlags.warUnlocked && gameState.year < -670) { addMessage("Warfare not unlocked until 670 BCE or Event."); return; }

        const neighbor = gameState.neighbors.find(n => n.id === neighborId);
        if (!neighbor || neighbor.isConquered) return;
        if (neighbor.relationship === 'Ally') { addMessage("Cannot attack an ally!"); return; }

        const myMartial = gameState.civilization.stats.martial;
        const enemyStr = neighbor.martial + neighbor.defense;

        if (myMartial < 1) { addMessage("You have no martial strength."); return; }

        const win = myMartial > enemyStr;

        if (win) {
            setGameState(prev => ({
                ...prev,
                neighbors: prev.neighbors.map(n => n.id === neighborId ? { ...n, isConquered: true } : n),
                messages: [`Victory against ${neighbor.name}!`, ...prev.messages],
                civilization: {
                    ...prev.civilization,
                    stats: { ...prev.civilization.stats, martial: prev.civilization.stats.martial + 5 }
                }
            }));
        } else {
            addMessage(`Defeat! ${neighbor.name} (Str: ${enemyStr}) was too strong.`);
        }
    };

    return {
        gameState,
        setGameState,
        tiles,
        setTiles,
        activeTab,
        setActiveTab,
        startGame,
        initiateAdvance,
        closeEventPopup,
        finalizeAdvance,
        handleTileClick,
        buildWonder,
        foundReligion,
        spreadReligion,
        formAlliance,
        attackNeighbor
    };
};
