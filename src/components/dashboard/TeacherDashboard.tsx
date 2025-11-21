import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Users, Calendar, Ticket, Clock, Trash2 } from 'lucide-react';
import { teacherAPI, auth } from '../../utils/api';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, activeSessions: 0, totalPeriods: 0 });
  const [loading, setLoading] = useState(true);

  // Create period form
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [periodName, setPeriodName] = useState('');
  const [startYear, setStartYear] = useState(-50000);
  const [endYear, setEndYear] = useState(362);

  // Create invite code form
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  // Derived state for the currently selected period object
  const activePeriod = periods.find(p => p.id === selectedPeriodId);

  useEffect(() => {
    const userData = auth.getUser();
    if (!userData || userData.role !== 'teacher') {
      navigate('/teacher/login');
      return;
    }
    setUser(userData);
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    setLoading(true);

    const [dashboardResult, periodsResult, inviteCodesResult, studentsResult] = await Promise.all([
      teacherAPI.getDashboard(),
      teacherAPI.getPeriods(),
      teacherAPI.getInviteCodes(),
      teacherAPI.getStudents()
    ]);

    if (dashboardResult.data) {
      setStats((dashboardResult.data as any).stats);
    }

    if (periodsResult.data) {
      setPeriods((periodsResult.data as any).periods);
    }

    if (inviteCodesResult.data) {
      setInviteCodes((inviteCodesResult.data as any).inviteCodes);
    }

    if (studentsResult.data) {
      setStudents((studentsResult.data as any).students);
    }

    setLoading(false);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await teacherAPI.createPeriod(periodName, startYear, endYear);
      if (result.data) {
        const { period, inviteCode } = result.data as any;
        setShowPeriodForm(false);
        setPeriodName('');

        // Update state immediately
        setPeriods(prev => [period, ...prev]);
        if (inviteCode) {
          setInviteCodes(prev => [{ code: inviteCode, period_id: period.id }, ...prev]);
          setInviteCodes(prev => [{ code: inviteCode, period_id: period.id }, ...prev]);
          // Alert removed - code will be visible in the dashboard
        }

        // Reload dashboard in background to ensure consistency
        loadDashboard();
      } else {
        console.error('Failed to create period:', result.error);
        alert(`Failed to create period: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating period:', error);
      alert('An unexpected error occurred while creating the period.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriodId) return;

    setIsSubmitting(true);
    try {
      const result = await teacherAPI.generateInviteCode(selectedPeriodId);
      if (result.data) {
        setShowInviteForm(false);
        loadDashboard();
      } else {
        console.error('Failed to generate invite code:', result.error);
        alert(`Failed to generate invite code: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating invite code:', error);
      alert('An unexpected error occurred while generating the invite code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimelineUpdate = async (action: 'advance' | 'back' | 'resume') => {
    if (!activePeriod) return;

    // This is a placeholder logic for timeline updates
    // In a real app, you'd calculate the next year based on game logic
    let newYear = activePeriod.current_year;

    if (action === 'advance') {
      newYear += 100; // Advance 100 years
    } else if (action === 'back') {
      newYear -= 100; // Go back 100 years
    }

    // Call API to update
    try {
      await teacherAPI.updateTimeline(activePeriod.id, newYear);

      // Optimistic update
      setPeriods(prev => prev.map(p =>
        p.id === activePeriod.id ? { ...p, current_year: newYear } : p
      ));
    } catch (error) {
      console.error('Failed to update timeline:', error);
    }
  };

  const handleDeletePeriod = async (periodId: string) => {
    if (window.confirm('Are you sure you want to delete this period? This action cannot be undone.')) {
      const result = await teacherAPI.deletePeriod(periodId);
      if (result.data) {
        loadDashboard();
      }
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: 'url(/images/tower-of-babel.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="text-white text-2xl font-medium relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/tower-of-babel.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Through History - Teacher Dashboard</h1>
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
          {!activePeriod ? (
            /* Class Periods List View */
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-7 h-7 text-slate-700" />
                  Class Periods
                </h2>
                <button
                  onClick={() => setShowPeriodForm(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Create New Period
                </button>
              </div>

              <div className="space-y-4">
                {periods.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-2">No class periods yet</p>
                    <button
                      onClick={() => setShowPeriodForm(true)}
                      className="text-red-600 font-medium hover:underline"
                    >
                      Create your first period
                    </button>
                  </div>
                ) : (
                  periods.map((period) => {
                    const periodInvites = inviteCodes.filter(code => code.period_id === period.id);
                    const periodStudents = students.filter(s => s.period_id === period.id);
                    const inviteCode = periodInvites[0]?.code || 'None';

                    return (
                      <div key={period.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{period.name}</h3>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Ticket className="w-4 h-4 text-amber-500" />
                                <span className="text-sm">Invite Code: <span className="font-bold text-slate-900">{inviteCode}</span></span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">Students: {periodStudents.length}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Year: {period.current_year} BCE</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <div className="w-4 flex justify-center">
                                  <div className={`w-2 h-2 rounded-full ${period.current_year ? 'bg-green-500' : 'bg-slate-300'}`} />
                                </div>
                                <span className="text-sm">Status: {period.current_year ? 'Paused' : 'Not Started'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                          <button
                            onClick={() => setSelectedPeriodId(period.id)}
                            className="flex-1 bg-red-700 hover:bg-red-800 text-white py-2.5 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(period.id)}
                            className="px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Game Control View */
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🎮</span>
                  </div>
                  {activePeriod.name} - Game Control
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeletePeriod(activePeriod.id)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Period
                  </button>
                  <button
                    onClick={() => setSelectedPeriodId(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <span className="text-2xl text-slate-400">×</span>
                  </button>
                </div>
              </div>

              {/* Invite Code Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-1">Invite Code</h3>
                    {inviteCodes.find(ic => ic.period_id === activePeriod.id)?.code ? (
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-slate-900 tracking-widest font-mono">
                          {inviteCodes.find(ic => ic.period_id === activePeriod.id)?.code}
                        </div>
                        <button
                          onClick={() => {
                            const code = inviteCodes.find(ic => ic.period_id === activePeriod.id)?.code;
                            if (code) {
                              navigator.clipboard.writeText(code);
                              alert('Code copied to clipboard!');
                            }
                          }}
                          className="text-sm text-amber-700 hover:text-amber-900 underline font-medium"
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-amber-900 mb-2">No invite code generated yet.</p>
                        <button
                          onClick={() => setShowInviteForm(true)}
                          className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                        >
                          Generate Code →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Control */}
              <div className="bg-blue-50/80 backdrop-blur-md rounded-xl p-8 border border-blue-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Timeline Control</h3>

                <div className="flex justify-between items-end mb-8">
                  <div>
                    <div className="text-5xl font-bold text-purple-600 mb-1">
                      {Math.abs(activePeriod.current_year)} {activePeriod.current_year < 0 ? 'BCE' : 'CE'}
                    </div>
                    <div className="text-slate-500 text-sm font-medium">Current Year</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600 mb-1">0 / 26</div>
                    <div className="text-slate-500 text-sm font-medium">Event Progress</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleTimelineUpdate('advance')}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="text-lg">⏩</span> Advance Timeline
                  </button>
                  <button
                    onClick={() => handleTimelineUpdate('back')}
                    className="bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="text-lg">⏪</span> Go Back
                  </button>
                  <button
                    onClick={() => handleTimelineUpdate('resume')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="text-lg">▶️</span> Resume
                  </button>
                </div>
              </div>

              {/* Civilizations Table */}
              <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-xl">🌐</span> Civilizations ({students.filter(s => s.period_id === activePeriod.id).length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <th className="px-6 py-4">Civilization</th>
                        <th className="px-6 py-4 text-center">Pop.</th>
                        <th className="px-6 py-4 text-center">🏠</th>
                        <th className="px-6 py-4 text-center">⛪</th>
                        <th className="px-6 py-4 text-center">🎭</th>
                        <th className="px-6 py-4 text-center">🧱</th>
                        <th className="px-6 py-4 text-center">🗼</th>
                        <th className="px-6 py-4 text-center">Wonders</th>
                        <th className="px-6 py-4 text-center">Religion</th>
                        <th className="px-6 py-4 text-center">Faith</th>
                        <th className="px-6 py-4 text-center">Science</th>
                        <th className="px-6 py-4 text-center">Martial</th>
                        <th className="px-6 py-4 text-center">Defense</th>
                        <th className="px-6 py-4 text-center">Achievements</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {students.filter(s => s.period_id === activePeriod.id).length === 0 ? (
                        <tr>
                          <td colSpan={15} className="px-6 py-8 text-center text-slate-500">
                            No civilizations in this period yet.
                          </td>
                        </tr>
                      ) : (
                        students
                          .filter(s => s.period_id === activePeriod.id)
                          .map((student) => {
                            // Parse game state if available
                            let stats = {
                              population: 0,
                              houses: 0,
                              temples: 0,
                              theaters: 0,
                              walls: 0,
                              towers: 0,
                              wonders: '-',
                              religion: '-',
                              faith: 0,
                              science: 0,
                              martial: 0,
                              defense: 0,
                              achievements: '-'
                            };

                            if (student.game_state) {
                              try {
                                const gameState = JSON.parse(student.game_state);
                                if (gameState.resources) {
                                  stats.population = gameState.resources.population || 0;
                                  stats.faith = gameState.resources.faith || 0;
                                  stats.science = gameState.resources.science || 0;
                                }
                                // Add other stats parsing here as they become available in game state
                              } catch (e) {
                                console.error('Error parsing game state for student', student.id, e);
                              }
                            }

                            return (
                              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                                    <div>
                                      <div className="font-bold text-slate-900">{student.civilization_id || 'Unknown'}</div>
                                      <div className="text-xs text-slate-500">{student.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700">{stats.population}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.houses}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.temples}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.theaters}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.walls}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.towers}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.wonders}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.religion}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.faith}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.science}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.martial}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.defense}</td>
                                <td className="px-6 py-4 text-center text-slate-600">{stats.achievements}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Period Modal */}
      {showPeriodForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Create New Period</h3>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period Name</label>
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Period 1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Year</label>
                  <input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Year</label>
                  <input
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Period'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPeriodForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Invite Code Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Generate Invite Code</h3>
            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  This will generate a new invite code for students to join this period.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Code'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
