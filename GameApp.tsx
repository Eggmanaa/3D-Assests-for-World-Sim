import React from 'react';
import { Play, X, Hammer, FlaskConical, Sword, Sprout, Star, RotateCcw } from 'lucide-react';
import MapScene from './components/MapScene';
import CivilizationSelector from './src/game/components/CivilizationSelector';
import StatsPanel from './src/game/components/StatsPanel';
import ActionPanels from './src/game/components/ActionPanels';
import { TIMELINE_EVENTS } from './constants';
import { GameState } from './types';
import { useGameLogic } from './src/game/hooks/useGameLogic';

interface GameAppProps {
    initialGameState?: GameState;
    onGameStateChange?: (gameState: GameState) => void;
    isSinglePlayer?: boolean;
}

const App: React.FC<GameAppProps> = ({ initialGameState, onGameStateChange, isSinglePlayer = false }) => {
    const {
        gameState,
        setGameState,
        tiles,
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
    } = useGameLogic({ initialGameState, onGameStateChange });

    // Reset game handler for single-player mode
    const handleResetGame = () => {
        if (!isSinglePlayer) return;

        if (confirm('Are you sure you want to reset the simulation? This will start a new game and cannot be undone.')) {
            // Clear the single-player saved game from localStorage
            localStorage.removeItem('world_sim_direct_save');
            // Reload the page to restart
            window.location.reload();
        }
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
                                        <div className="bg-red-500 p-3 rounded-full"><Sword className="text-white" /></div>
                                        <div><div className="font-bold text-lg">Warpath</div><div className="text-sm text-slate-300">+50% Martial Strength</div></div>
                                    </button>
                                    <button onClick={() => finalizeAdvance('fertility')} className="p-4 bg-green-900/40 border border-green-500 hover:bg-green-900/60 rounded-xl flex items-center gap-4 text-left">
                                        <div className="bg-green-500 p-3 rounded-full"><Sprout className="text-white" /></div>
                                        <div><div className="font-bold text-lg">Growth</div><div className="text-sm text-slate-300">+50% Fertility</div></div>
                                    </button>
                                </>
                            )}
                            {civ.culturalStage === 'Classical' && (
                                <>
                                    <button onClick={() => finalizeAdvance('science')} className="p-4 bg-blue-900/40 border border-blue-500 hover:bg-blue-900/60 rounded-xl flex items-center gap-4 text-left">
                                        <div className="bg-blue-500 p-3 rounded-full"><FlaskConical className="text-white" /></div>
                                        <div><div className="font-bold text-lg">Innovation</div><div className="text-sm text-slate-300">+50% Science</div></div>
                                    </button>
                                    <button onClick={() => finalizeAdvance('faith')} className="p-4 bg-yellow-900/40 border border-yellow-500 hover:bg-yellow-900/60 rounded-xl flex items-center gap-4 text-left">
                                        <div className="bg-yellow-500 p-3 rounded-full"><Star className="text-white" /></div>
                                        <div><div className="font-bold text-lg">Piety</div><div className="text-sm text-slate-300">+50% Faith</div></div>
                                    </button>
                                </>
                            )}
                            {(civ.culturalStage === 'Imperial' || civ.culturalStage === 'Decline') && (
                                <>
                                    <button onClick={() => finalizeAdvance('industry')} className="p-4 bg-amber-900/40 border border-amber-500 hover:bg-amber-900/60 rounded-xl flex items-center gap-4 text-left">
                                        <div className="bg-amber-500 p-3 rounded-full"><Hammer className="text-white" /></div>
                                        <div><div className="font-bold text-lg">Industry</div><div className="text-sm text-slate-300">+50% Production</div></div>
                                    </button>
                                    <button onClick={() => finalizeAdvance('martial')} className="p-4 bg-red-900/40 border border-red-500 hover:bg-red-900/60 rounded-xl flex items-center gap-4 text-left">
                                        <div className="bg-red-500 p-3 rounded-full"><Sword className="text-white" /></div>
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
                <div className="flex items-center gap-3">
                    {isSinglePlayer && (
                        <button
                            onClick={handleResetGame}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-red-900/20 transition-colors"
                        >
                            <RotateCcw size={16} /> Reset Simulation
                        </button>
                    )}
                    <button onClick={initiateAdvance} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-indigo-900/20">
                        <Play size={16} fill="currentColor" /> Advance Turn
                    </button>
                </div>
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
