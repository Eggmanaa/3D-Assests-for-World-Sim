import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Play, Trophy, Clock } from 'lucide-react';
import { studentAPI, auth } from '../../utils/api';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [civilizations, setCivilizations] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCivSelector, setShowCivSelector] = useState(false);
  
  useEffect(() => {
    const userData = auth.getUser();
    if (!userData || userData.role !== 'student') {
      navigate('/student/login');
      return;
    }
    setUser(userData);
    loadDashboard();
  }, [navigate]);
  
  const loadDashboard = async () => {
    setLoading(true);
    
    const [dashboardResult, civsResult, leaderboardResult] = await Promise.all([
      studentAPI.getDashboard(),
      studentAPI.getCivilizations(),
      studentAPI.getLeaderboard()
    ]);
    
    if (dashboardResult.data) {
      setStudent(dashboardResult.data.student);
      setSessions(dashboardResult.data.sessions);
    }
    
    if (civsResult.data) {
      setCivilizations(civsResult.data.civilizations);
    }
    
    if (leaderboardResult.data) {
      setLeaderboard(leaderboardResult.data.leaderboard);
    }
    
    setLoading(false);
  };
  
  const handleCreateSession = async (civId: string) => {
    if (!student?.period_id) return;
    
    const result = await studentAPI.createGameSession(civId, student.period_id);
    if (result.data) {
      setShowCivSelector(false);
      navigate(`/game/${result.data.session.id}`);
    }
  };
  
  const handlePlaySession = (sessionId: number) => {
    navigate(`/game/${sessionId}`);
  };
  
  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-blue-400/30">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Student Dashboard</h1>
              <p className="text-gray-300">Welcome, {user?.name}! ({student?.period_name})</p>
              <p className="text-gray-400 text-sm">Current Year: {student?.current_year || -50000}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Sessions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">My Game Sessions</h2>
                <button
                  onClick={() => setShowCivSelector(true)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  New Game
                </button>
              </div>
              
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No game sessions yet. Start a new game!</p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-bold capitalize">{session.civilization_id}</h3>
                        <p className="text-gray-400 text-sm">
                          Status: {session.status} • Last played: {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePlaySession(session.id)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Civilization Selector Modal */}
            {showCivSelector && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-white mb-4">Choose Your Civilization</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {civilizations.map((civ) => (
                      <button
                        key={civ.id}
                        onClick={() => handleCreateSession(civ.id)}
                        className="bg-white/10 hover:bg-white/20 p-4 rounded-lg border border-white/10 hover:border-white/30 transition-all"
                        style={{ borderColor: civ.color + '30' }}
                      >
                        <h4 className="text-white font-bold mb-1">{civ.name}</h4>
                        <p className="text-gray-400 text-sm">{civ.description}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCivSelector(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Games Played</span>
                  <span className="text-white font-bold">{sessions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Class Period</span>
                  <span className="text-white font-bold">{student?.period_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Year</span>
                  <span className="text-white font-bold">{student?.current_year || -50000}</span>
                </div>
              </div>
            </div>
            
            {/* Leaderboard */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Class Leaderboard</h3>
              </div>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <span className="text-lg font-bold text-amber-400 w-6">#{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{entry.name}</p>
                      <p className="text-gray-400 text-xs">{entry.games_played} games</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
