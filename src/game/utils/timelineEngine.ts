import { TimelineEventAction, GameState, NeighborCiv, StatKey } from '../../../types';
import { checkSavingThrow } from './gameHelpers';

interface ProcessEventResult {
    changes: Partial<GameState['civilization']['stats']>;
    newFlags: any;
    newGameFlags: any;
    messages: string[];
    housesLost: number;
    neighborsToAdd: NeighborCiv[];
}

export const processTimelineEvent = (
    event: any,
    currentCiv: GameState['civilization'],
    gameFlags: any,
    currentNeighbors: NeighborCiv[]
): ProcessEventResult => {
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
