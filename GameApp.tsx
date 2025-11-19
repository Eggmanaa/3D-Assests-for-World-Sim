
import React, { useState, useEffect } from 'react';
import { Play, X, Hammer, FlaskConical, Palette, Sword, History } from 'lucide-react';
import MapScene from './components/MapScene';
import CivilizationSelector from './src/game/components/CivilizationSelector';
import StatsPanel from './src/game/components/StatsPanel';
import ActionPanels from './src/game/components/ActionPanels';
import { generateMap, TIMELINE_EVENTS, GENERATE_NEIGHBORS } from './constants';
import { TileData, BuildingType, GameState, CivPreset, WATER_CAPACITIES, TimelineEventAction } from './types';
import { checkSavingThrow, calculateStats } from './src/game/utils/gameHelpers';

const App: React.FC = () => {
  // --- STATE ---
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [activeTab, setActiveTab] = useState<'build' | 'wonders' | 'religion' | 'war'>('build');
  const [gameState, setGameState] = useState<GameState>({
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

  // Temporary storage for the active turn bonus
  const [turnBonus, setTurnBonus] = useState<any>({});

  // --- ACTIONS ---

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

  const processTimelineEvent = (event: any, currentCiv: GameState['civilization'], gameFlags: any, currentNeighbors: NeighborCiv[]) => {
      const messages: string[] = []; // Only specific outcomes here
      const changes: Partial<GameState['civilization']['stats']> = {};
      const newFlags = { ...currentCiv.flags };
      const newGameFlags = { ...gameFlags };
      const neighborsToAdd: NeighborCiv[] = [];
      let housesLost = 0;

      if (event.actions) {
          event.actions.forEach((action: TimelineEventAction) => {
              // Check if action applies to this civ (Region Match)
              const isTarget = !action.targetRegions || action.targetRegions.some(r => currentCiv.regions.includes(r));
              
              if (!isTarget && action.type !== 'SET_FLAG' && action.type !== 'SPECIAL' && action.type !== 'ADD_NEIGHBOR') return;
              
              if (action.type === 'MODIFY_STAT' && action.stat) {
                  const currentVal = (currentCiv.stats as any)[action.stat] || 0;
                  let newVal = currentVal;
                  
                  let modValue = action.value || 0;
                  
                  // Value Source: Dynamic from current stats (e.g. value = number of houses)
                  if (action.valueSource === 'houses') {
                      modValue = currentCiv.stats.houses;
                  }

                  if (action.isPercent) {
                      newVal += Math.floor(currentVal * (modValue / 100));
                  } else {
                      newVal += modValue;
                  }
                  (changes as any)[action.stat] = newVal;
                  
                  // Format message with actual value
                  const valStr = action.isPercent ? `${modValue}%` : `${modValue}`;
                  messages.push(action.message.replace('VAL', valStr));
              }

              else if (action.type === 'DISASTER') {
                   const saved = checkSavingThrow(currentCiv, action.saveTrait, action.saveStat, action.saveDC);
                   if (saved) {
                       messages.push(`DISASTER AVERTED: ${action.message.split('(')[0]} (Saved!)`);
                   } else {
                       messages.push(`DISASTER STRUCK: ${action.message}`);
                       if (action.failEffect?.houseLossPercent) {
                           housesLost = Math.floor(currentCiv.stats.houses * (action.failEffect.houseLossPercent / 100));
                       }
                       if (action.failEffect?.popSetTo !== undefined) {
                           // handled in main return
                           changes.population = action.failEffect.popSetTo;
                           changes.houses = action.failEffect.popSetTo;
                       }
                   }
              }

              else if (action.type === 'SET_FLAG' && action.flagName) {
                  // Global flags vs Civ flags
                  if (action.flagName === 'warUnlocked') newGameFlags.warUnlocked = true;
                  else if (action.flagName === 'religionUnlocked') newGameFlags.religionUnlocked = true;
                  else if (action.flagName === 'housesSupportTwoPop') newFlags.housesSupportTwoPop = true;
                  else if (isTarget) {
                      (newFlags as any)[action.flagName] = true;
                  }
                  messages.push(action.message);
              }

              else if (action.type === 'ADD_NEIGHBOR' && action.neighbor) {
                  const newNeighbor: NeighborCiv = {
                      id: `n-${event.year}`,
                      name: action.neighbor.name || 'Unknown',
                      martial: action.neighbor.martial || 10,
                      defense: action.neighbor.defense || 5,
                      faith: action.neighbor.faith || 5,
                      isConquered: false,
                      relationship: 'Neutral'
                  };
                  neighborsToAdd.push(newNeighbor);
                  messages.push(action.message);
              }
          });
      }

      return { changes, newFlags, newGameFlags, messages, housesLost, neighborsToAdd };
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

  const addMessage = (msg: string) => {
      setGameState(prev => ({
          ...prev,
          messages: [msg, ...prev.messages.slice(0, 4)]
      }));
  };

  // --- RENDER HELPERS ---

  if (!gameState.hasStarted) {
      return <CivilizationSelector onSelectCivilization={startGame} />;
  }

  const { civilization: civ } = gameState;

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden font-sans text-slate-200 relative">
      
      {/* EVENT POPUP MODAL */}
      {gameState.currentEventPopup && (
          <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-slate-800 border border-slate-600 p-8 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col gap-6 relative">
                   <button onClick={closeEventPopup} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                      <X size={24} />
                  </button>

                  <div className="text-center space-y-2">
                      <div className="text-amber-500 font-bold tracking-widest uppercase text-sm">Historical Event • {Math.abs(gameState.currentEventPopup.year)} {gameState.currentEventPopup.year < 0 ? 'BCE' : 'CE'}</div>
                      <h2 className="text-4xl font-bold text-white font-serif">{gameState.currentEventPopup.name}</h2>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 text-lg text-slate-300 leading-relaxed text-center italic font-serif">
                      "{gameState.currentEventPopup.description}"
                  </div>

                  <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Outcomes</h3>
                      {gameState.currentEventPopup.effects.length > 0 ? (
                           <ul className="space-y-2">
                              {gameState.currentEventPopup.effects.map((effect, i) => (
                                  <li key={i} className="flex items-start gap-3 text-slate-200 bg-slate-700/50 p-3 rounded-lg border border-slate-600 text-sm">
                                      <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-amber-500"></div>
                                      <span>{effect}</span>
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <div className="text-slate-500 italic text-center p-4 bg-slate-900/30 rounded-lg border border-dashed border-slate-700">
                              No immediate effects on your civilization.
                          </div>
                      )}
                  </div>

                  <button onClick={closeEventPopup} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 text-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2">
                      Continue History <Play size={20} fill="currentColor" />
                  </button>
              </div>
          </div>
      )}

      {/* GROWTH CHOICE MODAL */}
      {gameState.pendingTurnChoice && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-slate-800 border border-slate-600 p-8 rounded-2xl max-w-lg w-full shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-2">New Era: {civ.culturalStage}</h2>
                  <p className="text-slate-400 mb-6">Choose your civilization's focus for this growth phase.</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                      {civ.culturalStage === 'Barbarism' && (
                          <>
                              <button onClick={() => finalizeAdvance('martial')} className="p-4 bg-red-900/40 border border-red-500 hover:bg-red-900/60 rounded-xl flex items-center gap-4 text-left">
                                  <div className="bg-red-500 p-3 rounded-full"><Sword className="text-white"/></div>
                                  <div><div className="font-bold text-lg">Warpath</div><div className="text-sm text-slate-300">+50% Martial Strength</div></div>
                              </button>
                              <button onClick={() => finalizeAdvance('fertility')} className="p-4 bg-green-900/40 border border-green-500 hover:bg-green-900/60 rounded-xl flex items-center gap-4 text-left">
                                  <div className="bg-green-500 p-3 rounded-full"><Sprout className="text-white"/></div>
                                  <div><div className="font-bold text-lg">Growth</div><div className="text-sm text-slate-300">+50% Fertility</div></div>
                              </button>
                          </>
                      )}
                      {civ.culturalStage === 'Classical' && (
                          <>
                              <button onClick={() => finalizeAdvance('science')} className="p-4 bg-blue-900/40 border border-blue-500 hover:bg-blue-900/60 rounded-xl flex items-center gap-4 text-left">
                                  <div className="bg-blue-500 p-3 rounded-full"><FlaskConical className="text-white"/></div>
                                  <div><div className="font-bold text-lg">Innovation</div><div className="text-sm text-slate-300">+50% Science</div></div>
                              </button>
                              <button onClick={() => finalizeAdvance('faith')} className="p-4 bg-yellow-900/40 border border-yellow-500 hover:bg-yellow-900/60 rounded-xl flex items-center gap-4 text-left">
                                  <div className="bg-yellow-500 p-3 rounded-full"><Star className="text-white"/></div>
                                  <div><div className="font-bold text-lg">Piety</div><div className="text-sm text-slate-300">+50% Faith</div></div>
                              </button>
                          </>
                      )}
                      {(civ.culturalStage === 'Imperial' || civ.culturalStage === 'Decline') && (
                           <>
                              <button onClick={() => finalizeAdvance('industry')} className="p-4 bg-amber-900/40 border border-amber-500 hover:bg-amber-900/60 rounded-xl flex items-center gap-4 text-left">
                                  <div className="bg-amber-500 p-3 rounded-full"><Hammer className="text-white"/></div>
                                  <div><div className="font-bold text-lg">Industry</div><div className="text-sm text-slate-300">+50% Production</div></div>
                              </button>
                              <button onClick={() => finalizeAdvance('martial')} className="p-4 bg-red-900/40 border border-red-500 hover:bg-red-900/60 rounded-xl flex items-center gap-4 text-left">
                                  <div className="bg-red-500 p-3 rounded-full"><Sword className="text-white"/></div>
                                  <div><div className="font-bold text-lg">Conquest</div><div className="text-sm text-slate-300">+50% Martial</div></div>
                              </button>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* TOP BAR */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-md z-20">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-orange-500">{civ.name}</h1>
            <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${gameState.year >= 0 ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                {Math.abs(gameState.year)} {gameState.year >= 0 ? 'CE' : 'BCE'}
            </div>
            <div className="text-xs text-slate-500 border-l border-slate-700 pl-4 hidden md:block">
                {TIMELINE_EVENTS[gameState.timelineIndex]?.name}
            </div>
        </div>
        <button onClick={initiateAdvance} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-indigo-900/20">
            <Play size={16} fill="currentColor" /> Advance Turn
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
          {/* LEFT STATS */}
          <StatsPanel civilization={civ} />

          {/* MAP */}
          <section className="flex-1 relative bg-slate-950">
              <MapScene tiles={tiles} onTileClick={handleTileClick} />
              {gameState.placingWonder && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-6 py-3 rounded-full font-bold shadow-xl z-20 animate-bounce">
                      CLICK A TILE TO PLACE YOUR WONDER
                  </div>
              )}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-slate-900/90 backdrop-blur border border-slate-700 px-6 py-2 rounded-full shadow-2xl z-10">
                   <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 bg-[#166534] rounded-sm"></div> Forest</div>
                   <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 bg-[#78716c] rounded-sm"></div> Mountain</div>
              </div>
          </section>

          {/* RIGHT TABBED PANEL */}
          <div className="flex flex-col w-80">
            <ActionPanels
              activeTab={activeTab}
              civilization={civ}
              gameState={gameState}
              onSelectAction={(action) => setGameState(p => ({ ...p, selectedAction: action }))}
              onBuildWonder={buildWonder}
              onFoundReligion={foundReligion}
              onSpreadReligion={spreadReligion}
              onFormAlliance={formAlliance}
              onDeclareWar={attackNeighbor}
              onTabChange={setActiveTab}
            />
            
            {/* MESSAGE LOG (Fixed at bottom of panel) */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 h-32 overflow-y-auto">
              {gameState.messages.map((msg, i) => (
                <div key={i} className="mb-1 pb-1 border-b border-slate-900 last:border-0">
                  <span className="text-slate-600 mr-2">{'>'}</span>{msg}
                </div>
              ))}
            </div>
          </div>
      </main>
    </div>
  );
};

export default App;
