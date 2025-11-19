import React from 'react';
import { Home } from 'lucide-react';
import { GameState } from '../../../types';

interface StatsPanelProps {
  civilization: GameState['civilization'];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ civilization: civ }) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-xl">
      <div className="p-4 border-b border-slate-800 space-y-4">
        {/* Houses Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-orange-400 flex items-center gap-2">
              <Home size={14}/> Houses ({civ.flags.housesSupportTwoPop ? '2x' : '1x'} Pop)
            </span>
            <span>{civ.stats.houses}/{civ.stats.capacity}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-orange-500 h-full" 
              style={{ width: `${(civ.stats.houses / civ.stats.capacity) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-500 mt-1 text-right">
            Built this turn: {civ.stats.housesBuiltThisTurn}/{civ.stats.fertility}
          </div>
        </div>

        {/* Industry and Fertility */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <div className="text-xs text-slate-400">Industry</div>
            <div className="text-lg font-bold text-amber-400">{civ.stats.industryLeft}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <div className="text-xs text-slate-400">Fertility</div>
            <div className="text-lg font-bold text-green-400">{civ.stats.fertility}</div>
          </div>
        </div>

        {/* Stats List */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-red-400">Martial</span>
            <b>{civ.stats.martial}</b>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-blue-400">Defense</span>
            <b>{civ.stats.defense}</b>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-yellow-400">Faith</span>
            <b>{civ.stats.faith}</b>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-pink-400">Culture</span>
            <b>{civ.stats.culture}</b>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-purple-400">Science</span>
            <b>{civ.stats.science}</b>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-cyan-400">Diplomacy</span>
            <b>{civ.stats.diplomacy}</b>
          </div>
        </div>
      </div>

      {/* Religion Display */}
      {civ.religion.name && (
        <div className="p-4 bg-yellow-900/20 m-2 rounded border border-yellow-700/30">
          <div className="text-xs text-yellow-500 uppercase font-bold">State Religion</div>
          <div className="text-sm font-bold text-yellow-100">{civ.religion.name}</div>
        </div>
      )}
    </aside>
  );
};

export default StatsPanel;
