import { TileData, BuildingType, TERRAIN_BONUSES, GameState, StatKey, NeighborCiv } from '../../../types';
import { WONDERS_LIST } from '../../../constants';

/**
 * Check if civilization passes a saving throw (trait or stat check)
 */
export const checkSavingThrow = (
  civ: GameState['civilization'], 
  trait?: string, 
  stat?: StatKey, 
  dc?: number
): boolean => {
  if (!trait && !stat) return true;
  
  // Trait Check (Auto-pass)
  if (trait) {
    const normalizedTrait = trait.toLowerCase();
    if (civ.traits.some(t => t.toLowerCase() === normalizedTrait)) {
      return true;
    }
  }

  // Stat Check (Roll vs DC)
  if (stat && dc !== undefined) {
    const statValue = civ.stats[stat];
    if (statValue >= dc) return true;
  }

  return false;
};

/**
 * Calculate civilization stats based on tiles, bonuses, and neighbors
 */
export const calculateStats = (
  tiles: TileData[], 
  civData: any, 
  activeBonuses: any, 
  neighbors: NeighborCiv[]
) => {
  // 1. Terrain Bonuses
  const terrainTypes = new Set(tiles.map(t => t.terrain));
  let terrainDefense = 0;
  let terrainIndustry = 0;
  
  terrainTypes.forEach(t => {
    const bonus = TERRAIN_BONUSES[t];
    if (bonus) {
      terrainDefense += bonus.defense;
      terrainIndustry += bonus.industry;
    }
  });
  
  if (civData.isIsland) terrainDefense += 7;

  // 2. Building Bonuses
  const buildings = tiles.map(t => t.building).filter(b => b !== BuildingType.None);
  let buildingDefense = 0;
  let buildingFaith = 0;
  let buildingCulture = 0;

  buildings.forEach(b => {
    if (b === BuildingType.Wall) {
      buildingDefense += (civData.flags.troyWallDouble ? 2 : 1);
    }
    if (b === BuildingType.Temple) buildingFaith += 2;
    if (b === BuildingType.Amphitheatre) {
      buildingCulture += 3;
      buildingFaith = Math.max(0, buildingFaith - 1);
    }
    if (b === BuildingType.ArchimedesTower) {
      buildingDefense += 20;
    }
  });

  // Wonder Bonuses
  if (civData.builtWonderId) {
    const wonder = WONDERS_LIST.find(w => w.id === civData.builtWonderId);
    if (wonder && wonder.bonus) {
      if (wonder.bonus.defense) buildingDefense += wonder.bonus.defense;
      if (wonder.bonus.faith) buildingFaith += wonder.bonus.faith;
      if (wonder.bonus.culture) buildingCulture += wonder.bonus.culture;
    }
  }

  // 3. Base + Multipliers
  let martial = civData.baseStats.martial;
  let defense = civData.baseStats.defense + terrainDefense + buildingDefense;
  let faith = civData.baseStats.faith + buildingFaith;
  let culture = civData.stats.culture + buildingCulture;
  let science = civData.stats.science;
  let fertility = civData.baseStats.fertility;
  let industry = civData.baseStats.industry + terrainIndustry;
  let diplomacy = civData.stats.diplomacy || 0;

  // Apply Religion Tenets
  if (civData.religion && civData.religion.tenets && civData.religion.tenets.length > 0) {
    const tenets = civData.religion.tenets;
    
    if (tenets.includes('monotheism')) {
      faith += 5;
    }
    if (tenets.includes('polytheism')) {
      const templeCount = tiles.filter(t => t.building === BuildingType.Temple).length;
      faith += (templeCount * 2);
    }
    if (tenets.includes('holy_war')) {
      const convertedCount = neighbors.filter(n => n.religion === civData.religion.name).length;
      martial += (convertedCount * 2);
    }
    if (tenets.includes('christianity')) {
      faith += 1;
      culture += 1;
    }
  }

  // Apply Traits
  if (civData.traits.includes('Strength')) martial *= 2;
  if (civData.traits.includes('Industrious')) industry *= 2;
  if (civData.traits.includes('Intelligence')) science = Math.max(1, science * 2);
  if (civData.traits.includes('Wisdom')) faith *= 2;
  if (civData.traits.includes('Health')) fertility += 2;
  if (civData.traits.includes('Beauty')) diplomacy += 1;
  if (civData.traits.includes('Creativity')) culture *= 2;

  // Apply Turn Bonus (Cultural Choice)
  if (activeBonuses.martial) martial = Math.floor(martial * 1.5);
  if (activeBonuses.fertility) fertility = Math.floor(fertility * 1.5);
  if (activeBonuses.science) science = Math.floor(science * 1.5);
  if (activeBonuses.faith) faith = Math.floor(faith * 1.5);
  if (activeBonuses.industry) industry = Math.floor(industry * 1.5);

  return {
    martial: Math.floor(martial), 
    defense: Math.floor(defense), 
    faith: Math.floor(faith), 
    culture: Math.floor(culture), 
    science: Math.floor(science), 
    fertility: Math.floor(fertility), 
    industry: Math.floor(industry),
    diplomacy: diplomacy
  };
};
