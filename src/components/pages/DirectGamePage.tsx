import React, { useState } from 'react';
import GameApp from '../../../GameApp';
import { GameState } from '../../../types';

const DirectGamePage: React.FC = () => {
    // Initialize state from localStorage if available
    const [initialState] = useState<GameState | undefined>(() => {
        const saved = localStorage.getItem('world_sim_direct_save');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved game', e);
                return undefined;
            }
        }
        return undefined;
    });

    const handleGameStateChange = (newState: GameState) => {
        // Save to localStorage on every state change
        // We use a timeout to debounce slightly if needed, but direct save is fine for now
        // as React state updates are batched.
        localStorage.setItem('world_sim_direct_save', JSON.stringify(newState));
    };

    return (
        <div className="h-screen w-full bg-slate-950">
            <GameApp
                initialGameState={initialState}
                onGameStateChange={handleGameStateChange}
                isSinglePlayer={true}
            />
        </div>
    );
};

export default DirectGamePage;
