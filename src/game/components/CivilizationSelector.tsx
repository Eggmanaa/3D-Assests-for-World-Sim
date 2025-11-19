import React from 'react';
import { Globe, Users, Droplet, Shield, Hammer, Heart, Brain, Sparkles, Palette } from 'lucide-react';
import { CIV_PRESETS } from '../../../constants';
import { CivPreset } from '../../../types';

interface CivilizationSelectorProps {
  onSelectCivilization: (preset: CivPreset) => void;
}

const CivilizationSelector: React.FC<CivilizationSelectorProps> = ({ onSelectCivilization }) => {
  const getTraitIcon = (trait: string) => {
    switch (trait.toLowerCase()) {
      case 'strength': return <Shield size={14} className="text-red-400" />;
      case 'industrious': return <Hammer size={14} className="text-amber-400" />;
      case 'intelligence': return <Brain size={14} className="text-purple-400" />;
      case 'wisdom': return <Sparkles size={14} className="text-yellow-400" />;
      case 'health': return <Heart size={14} className="text-green-400" />;
      case 'creativity': return <Palette size={14} className="text-pink-400" />;
      default: return <Users size={14} className="text-blue-400" />;
    }
  };

  const getWaterIcon = (resource: string) => {
    switch (resource) {
      case 'River': return '🏞️';
      case 'Sea': return '🌊';
      case 'Lake': return '🏝️';
      default: return '💧';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Globe size={64} className="text-orange-500 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-orange-500">Civilization</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Select a civilization to begin your journey through 50,000 years of history
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CIV_PRESETS.map(civ => (
            <button
              key={civ.id}
              onClick={() => onSelectCivilization(civ)}
              className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-orange-500/50 p-6 rounded-xl text-left transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">
                    {civ.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                    <span>{getWaterIcon(civ.waterResource)}</span>
                    <span>{civ.waterResource}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="text-xs text-slate-500 uppercase font-bold">Regions</div>
                <div className="flex flex-wrap gap-1">
                  {civ.regions.map(region => (
                    <span
                      key={region}
                      className="px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-400 border border-slate-700"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="text-xs text-slate-500 uppercase font-bold">Traits</div>
                <div className="flex flex-wrap gap-2">
                  {civ.traits.map(trait => (
                    <div
                      key={trait}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-900/50 rounded text-xs border border-slate-700"
                    >
                      {getTraitIcon(trait)}
                      <span className="text-slate-300">{trait}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <div className="text-slate-500 mb-1">Martial</div>
                  <div className="text-red-400 font-bold">{civ.baseStats.martial}</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <div className="text-slate-500 mb-1">Defense</div>
                  <div className="text-blue-400 font-bold">{civ.baseStats.defense}</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <div className="text-slate-500 mb-1">Fertility</div>
                  <div className="text-green-400 font-bold">{civ.baseStats.fertility}</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                  <div className="text-slate-500 mb-1">Industry</div>
                  <div className="text-amber-400 font-bold">{civ.baseStats.industry}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Each civilization has unique traits and starting advantages</p>
          <p className="mt-2">Choose wisely - your decision will shape the course of history!</p>
        </div>
      </div>
    </div>
  );
};

export default CivilizationSelector;
