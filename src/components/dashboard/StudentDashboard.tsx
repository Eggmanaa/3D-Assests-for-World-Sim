import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Play, Trophy, Clock, Users, Map } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-700 text-2xl font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
                <p className="text-slate-600 text-sm">Welcome, {user?.name}!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{student?.current_year || -50000}</div>
                    <div className="text-slate-600 text-sm">Current Year</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{sessions.length}</div>
                    <div className="text-slate-600 text-sm">Games Played</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Sessions */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Map className="w-6 h-6 text-slate-700" />
                  My Game Sessions
                </h2>
                <button
                  onClick={() => setShowCivSelector(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  New Game
                </button>
              </div>

              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-2">No game sessions yet</p>
                    <button
                      onClick={() => setShowCivSelector(true)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Start your first civilization
                    </button>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex justify-between items-center hover:border-slate-300 transition-colors">
                      <div>
                        <h3 className="text-slate-900 font-bold text-lg capitalize">{session.civilization_id}</h3>
                        <p className="text-slate-600 text-sm mt-1">
                          Status: <span className="font-medium text-slate-800 capitalize">{session.status}</span> • Last played: {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePlaySession(session.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                      >
                        <Play className="w-4 h-4" />
                        Resume
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Civilization Selector Modal */}
            {showCivSelector && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Civilization</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {civilizations.map((civ) => (
                      <button
                        key={civ.id}
                        onClick={() => handleCreateSession(civ.id)}
                        className="bg-slate-50 hover:bg-blue-50 p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-all text-left group"
                        style={{ borderLeftWidth: '4px', borderLeftColor: civ.color }}
                      >
                        <h4 className="text-slate-900 font-bold mb-2 text-lg group-hover:text-blue-700">{civ.name}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{civ.description}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCivSelector(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Class Info */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                Class Info
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="text-sm text-slate-500 mb-1">Current Period</div>
                <div className="text-lg font-bold text-slate-900">{student?.period_name}</div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-slate-900">Leaderboard</h3>
              </div>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-slate-500 border border-slate-200'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">{entry.name}</p>
                      <p className="text-slate-500 text-xs">{entry.games_played} games played</p>
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
