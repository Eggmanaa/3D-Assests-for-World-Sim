import React from 'react';
import { Home, Landmark, BrickWall, Users, TowerControl, Crown, Check, Star, Handshake, Sword, Hammer } from 'lucide-react';
import { BuildingType, GameState } from '../../../types';
import { WONDERS_LIST, RELIGION_TENETS } from '../../../constants';

interface ActionPanelsProps {
  activeTab: 'build' | 'wonders' | 'religion' | 'war';
  civilization: GameState['civilization'];
  gameState: GameState;
  onSelectAction: (action: BuildingType) => void;
  onBuildWonder: (wonder: any) => void;
  onFoundReligion: (tenetId: string, name: string) => void;
  onSpreadReligion: (neighborId: string) => void;
  onFormAlliance: (neighborId: string) => void;
  onDeclareWar: (neighborId: string) => void;
  onTabChange?: (tab: 'build' | 'wonders' | 'religion' | 'war') => void;
}

const ActionPanels: React.FC<ActionPanelsProps> = ({
  activeTab,
  civilization: civ,
  gameState,
  onSelectAction,
  onBuildWonder,
  onFoundReligion,
  onSpreadReligion,
  onFormAlliance,
  onDeclareWar,
  onTabChange
}) => {
  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-10 shadow-xl">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800">
        {['build', 'wonders', 'religion', 'war'].map(tab => (
          <button 
            key={tab}
            onClick={() => onTabChange && onTabChange(tab as any)}
            className={`flex-1 py-3 flex justify-center items-center text-slate-400 hover:bg-slate-800 transition-colors ${activeTab === tab ? 'border-b-2 border-orange-500 text-orange-500 bg-slate-800' : ''}`}
          >
            {tab === 'build' && <Hammer size={18} />}
            {tab === 'wonders' && <Crown size={18} />}
            {tab === 'religion' && <Star size={18} />}
            {tab === 'war' && <Sword size={18} />}
          </button>
        ))}
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* BUILD TAB */}
        {activeTab === 'build' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Structures</h2>
            
            <button 
              onClick={() => onSelectAction(BuildingType.House)} 
              className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${gameState.selectedAction === BuildingType.House ? 'bg-orange-900/30 border-orange-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <div className="p-2 bg-orange-600 rounded text-white"><Home size={18}/></div>
              <div>
                <div className="font-bold text-sm">House</div>
                <div className="text-xs text-slate-400">Cost: Fertility ({civ.stats.fertility - civ.stats.housesBuiltThisTurn} left)</div>
              </div>
            </button>

            <button 
              disabled={civ.stats.industryLeft < 10} 
              onClick={() => onSelectAction(BuildingType.Temple)} 
              className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${gameState.selectedAction === BuildingType.Temple ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-800 border-slate-700'} ${civ.stats.industryLeft < 10 ? 'opacity-50' : ''}`}
            >
              <div className="p-2 bg-blue-600 rounded text-white"><Landmark size={18}/></div>
              <div>
                <div className="font-bold text-sm">Temple</div>
                <div className="text-xs text-slate-400">Cost: 10 Ind</div>
              </div>
            </button>

            <button 
              disabled={civ.stats.industryLeft < 10} 
              onClick={() => onSelectAction(BuildingType.Wall)} 
              className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${gameState.selectedAction === BuildingType.Wall ? 'bg-slate-700 border-slate-400' : 'bg-slate-800 border-slate-700'} ${civ.stats.industryLeft < 10 ? 'opacity-50' : ''}`}
            >
              <div className="p-2 bg-slate-500 rounded text-white"><BrickWall size={18}/></div>
              <div>
                <div className="font-bold text-sm">Wall</div>
                <div className="text-xs text-slate-400">Cost: 10 Ind</div>
              </div>
            </button>

            <button 
              disabled={civ.stats.industryLeft < 10} 
              onClick={() => onSelectAction(BuildingType.Amphitheatre)} 
              className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${gameState.selectedAction === BuildingType.Amphitheatre ? 'bg-pink-900/30 border-pink-500' : 'bg-slate-800 border-slate-700'} ${civ.stats.industryLeft < 10 ? 'opacity-50' : ''}`}
            >
              <div className="p-2 bg-pink-600 rounded text-white"><Users size={18}/></div>
              <div>
                <div className="font-bold text-sm">Amphitheatre</div>
                <div className="text-xs text-slate-400">Cost: 10 Ind</div>
              </div>
            </button>

            <button 
              disabled={civ.stats.industryLeft < 20 || civ.stats.science < 30} 
              onClick={() => onSelectAction(BuildingType.ArchimedesTower)} 
              className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 ${gameState.selectedAction === BuildingType.ArchimedesTower ? 'bg-purple-900/30 border-purple-500' : 'bg-slate-800 border-slate-700'} ${(civ.stats.industryLeft < 20 || civ.stats.science < 30) ? 'opacity-50' : ''}`}
            >
              <div className="p-2 bg-purple-600 rounded text-white"><TowerControl size={18}/></div>
              <div>
                <div className="font-bold text-sm">Archimedes Tower</div>
                <div className="text-xs text-slate-400">Cost: 20 Ind, 30 Sci</div>
              </div>
            </button>
          </div>
        )}

        {/* WONDERS TAB */}
        {activeTab === 'wonders' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Great Wonders</h2>
            {WONDERS_LIST.map(w => {
              const locked = gameState.year < w.minYear;
              const built = civ.builtWonderId === w.id;
              const affordable = civ.stats.industryLeft >= w.cost;
              return (
                <div key={w.id} className={`p-3 rounded-lg border bg-slate-800 ${built ? 'border-amber-500' : 'border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">{w.name}</span>
                    <span className="text-xs font-mono text-amber-400">{w.cost} Ind</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">{w.effects}</div>
                  {built ? (
                    <div className="text-xs text-amber-500 font-bold flex items-center gap-1">
                      <Check size={12}/> Constructed
                    </div>
                  ) : (
                    <button 
                      disabled={locked || !affordable || !!civ.builtWonderId}
                      onClick={() => onBuildWonder(w)}
                      className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {locked ? `Unlocks ${Math.abs(w.minYear)} BCE` : (!affordable ? 'Need Industry' : (civ.builtWonderId ? 'Max 1 Wonder' : 'Build'))}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* RELIGION TAB */}
        {activeTab === 'religion' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Theology</h2>
            {!civ.flags.religionFound ? (
              <div className="p-4 bg-slate-800 rounded border border-slate-700 text-center">
                <p className="text-sm text-slate-300 mb-3">Found a religion to guide your people.</p>
                {civ.flags.israelBonus && <p className="text-xs text-amber-400 mb-2">Israel Bonus: Pick 3 Tenets</p>}
                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  <div className={gameState.year >= -1000 || gameState.gameFlags.religionUnlocked ? 'text-green-400' : 'text-red-400'}>• Year 1000 BCE</div>
                  <div className={civ.stats.faith >= 10 ? 'text-green-400' : 'text-red-400'}>• 10 Faith</div>
                  <div className={civ.buildings.temples >= 1 ? 'text-green-400' : 'text-red-400'}>• 1 Temple</div>
                </div>
                {RELIGION_TENETS.map(t => (
                  !civ.religion.tenets.includes(t.id) && (
                    <button 
                      key={t.id} 
                      onClick={() => onFoundReligion(t.id, 'My Religion')} 
                      className="w-full mb-2 p-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-left"
                    >
                      <div className="font-bold text-amber-400">{t.name}</div>
                      <div className="text-slate-400">{t.description}</div>
                    </button>
                  )
                ))}
                {civ.religion.tenets.length > 0 && (
                  <div className="text-xs text-white mt-2">
                    Selected: {civ.religion.tenets.length}/{civ.flags.israelBonus ? 3 : 1}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-800 rounded border border-slate-700">
                <div className="text-center mb-4">
                  <Star className="mx-auto text-amber-500 mb-2" />
                  <h3 className="font-bold text-lg">{civ.religion.name}</h3>
                  <div className="text-xs text-slate-400">Founded {Math.abs(gameState.year)} BCE</div>
                </div>
                <div className="space-y-2">
                  {civ.religion.tenets.map(tid => (
                    <div key={tid} className="text-sm p-2 bg-slate-900 rounded border border-slate-700">
                      <span className="text-amber-500 font-bold">{RELIGION_TENETS.find(t => t.id === tid)?.name}</span>
                      <p className="text-xs text-slate-400 mt-1">{RELIGION_TENETS.find(t => t.id === tid)?.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h3 className="text-xs font-bold text-slate-500 mb-2">Spread Faith</h3>
                  {gameState.neighbors.map(n => (
                    <button 
                      key={n.id} 
                      onClick={() => onSpreadReligion(n.id)}
                      disabled={n.religion === civ.religion.name}
                      className="w-full p-2 mb-1 bg-slate-700 hover:bg-slate-600 text-xs rounded flex justify-between disabled:opacity-50"
                    >
                      <span>{n.name}</span>
                      {n.religion === civ.religion.name ? (
                        <span className="text-green-400 flex items-center gap-1"><Check size={12}/> Converted</span>
                      ) : (
                        <span className="text-amber-300">{n.faith} Faith</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WAR TAB */}
        {activeTab === 'war' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">War Room</h2>
            {(!gameState.gameFlags.warUnlocked && gameState.year < -670) ? (
              <div className="p-4 bg-slate-800/50 text-center text-sm text-slate-500 italic border border-slate-700 rounded">
                Warfare unlocks in 670 BCE
              </div>
            ) : (
              gameState.neighbors.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded border ${n.isConquered ? 'bg-slate-900 border-slate-800 opacity-50' : n.relationship === 'Ally' ? 'bg-slate-800 border-blue-500' : 'bg-slate-800 border-red-900/50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-200">{n.name}</span>
                    {n.isConquered && <span className="text-xs bg-red-900 text-red-200 px-2 rounded">Conquered</span>}
                    {n.relationship === 'Ally' && <span className="text-xs bg-blue-900 text-blue-200 px-2 rounded">Ally</span>}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mb-3">
                    <span>Strength: <b className="text-red-400">{n.martial + n.defense}</b></span>
                    {n.relationship !== 'Ally' && !n.isConquered && (
                      <button 
                        onClick={() => onFormAlliance(n.id)}
                        disabled={civ.stats.diplomacy < 1}
                        className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                      >
                        <Handshake size={12}/> Ally
                      </button>
                    )}
                  </div>
                  {!n.isConquered && n.relationship !== 'Ally' && (
                    <button 
                      onClick={() => onDeclareWar(n.id)}
                      className="w-full py-1 bg-red-900 hover:bg-red-800 text-red-100 text-xs rounded flex items-center justify-center gap-1"
                    >
                      <Sword size={12}/> Declare War
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ActionPanels;
