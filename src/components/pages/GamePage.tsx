import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import GameApp from '../../../GameApp';
import { studentAPI, auth } from '../../utils/api';

const GamePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gameStateRef, setGameStateRef] = useState<any>(null);
  
  useEffect(() => {
    const userData = auth.getUser();
    if (!userData || userData.role !== 'student') {
      navigate('/student/login');
      return;
    }
    
    loadSession();
  }, [sessionId, navigate]);
  
  const loadSession = async () => {
    if (!sessionId) return;
    
    const result = await studentAPI.getGameSession(sessionId);
    if (result.data) {
      setSession(result.data.session);
    } else {
      navigate('/student/dashboard');
    }
    setLoading(false);
  };
  
  const handleSaveGame = async (gameState: any) => {
    if (!sessionId || saving) return;
    
    setSaving(true);
    await studentAPI.saveGameState(sessionId, gameState);
    setSaving(false);
  };
  
  // Auto-save every 30 seconds
  useEffect(() => {
    if (!gameStateRef) return;
    
    const interval = setInterval(() => {
      handleSaveGame(gameStateRef);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [gameStateRef]);
  
  const handleBackToDashboard = () => {
    if (gameStateRef) {
      handleSaveGame(gameStateRef);
    }
    navigate('/student/dashboard');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Game session not found</div>
      </div>
    );
  }
  
  return (
    <div className="relative h-screen">
      {/* Game Controls Overlay */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 bg-blue-500/90 hover:bg-blue-600 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Dashboard
        </button>
        
        <button
          onClick={() => gameStateRef && handleSaveGame(gameStateRef)}
          disabled={saving}
          className="flex items-center gap-2 bg-green-500/90 hover:bg-green-600 disabled:bg-green-500/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Game'}
        </button>
      </div>
      
      {/* Game Component */}
      <div className="h-full">
        <GameApp 
          initialGameState={session.game_state ? JSON.parse(session.game_state) : undefined}
          onGameStateChange={setGameStateRef}
        />
      </div>
    </div>
  );
};

export default GamePage;
