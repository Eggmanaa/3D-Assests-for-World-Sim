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
  const [selectedPeriod, setSelectedPeriod] = useState('');

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
        setShowPeriodForm(false);
        setPeriodName('');
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
    if (!selectedPeriod) return;

    setIsSubmitting(true);
    try {
      const result = await teacherAPI.generateInviteCode(selectedPeriod);
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
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalStudents}</div>
                  <div className="text-slate-600 text-sm font-medium">Total Students</div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalPeriods}</div>
                  <div className="text-slate-600 text-sm font-medium">Class Periods</div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{stats.activeSessions}</div>
                  <div className="text-slate-600 text-sm font-medium">Active Sessions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Class Periods */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-slate-200 shadow-lg mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-slate-700" />
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

                  return (
                    <div key={period.id} className="bg-slate-50 p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-3">{period.name}</h3>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                Invite Code: <span className="font-mono font-bold text-blue-600">{periodInvites[0]?.code || 'None'}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">Students: <span className="font-bold">{periodStudents.length}</span></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Year: {period.start_year} to {period.end_year}</span>
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md font-medium text-xs">
                              Status: {period.current_year ? 'In Progress' : 'Not Started'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedPeriod(period.id);
                              setShowInviteForm(true);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(period.id)}
                            className="px-3 py-2 bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Students Section */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-slate-200 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-slate-700" />
              Students
            </h2>
            <div className="space-y-3">
              {students.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-500">No students yet</p>
                </div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-slate-900 font-bold">{student.name}</h3>
                      <p className="text-slate-600 text-sm">@{student.username} • {student.period_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
