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
      setStats(dashboardResult.data.stats);
    }

    if (periodsResult.data) {
      setPeriods(periodsResult.data.periods);
    }

    if (inviteCodesResult.data) {
      setInviteCodes(inviteCodesResult.data.inviteCodes);
    }

    if (studentsResult.data) {
      setStudents(studentsResult.data.students);
    }

    setLoading(false);
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await teacherAPI.createPeriod(periodName, startYear, endYear);
    if (result.data) {
      setShowPeriodForm(false);
      setPeriodName('');
      loadDashboard();
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await teacherAPI.generateInviteCode(selectedPeriod);
    if (result.data) {
      setShowInviteForm(false);
      loadDashboard();
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
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Through History - Teacher Dashboard</h1>
                <p className="text-slate-600 text-sm">Welcome, {user?.name}</p>
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.totalStudents}</div>
                <div className="text-slate-600 text-sm">Total Students</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.totalPeriods}</div>
                <div className="text-slate-600 text-sm">Class Periods</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.activeSessions}</div>
                <div className="text-slate-600 text-sm">Active Sessions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Periods */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-slate-700" />
              Class Periods
            </h2>
            <button
              onClick={() => setShowPeriodForm(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Period
            </button>
          </div>

          {showPeriodForm && (
            <form onSubmit={handleCreatePeriod} className="bg-slate-50 p-5 rounded-lg mb-6 border border-slate-200">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  placeholder="Period Name (e.g., Period 1)"
                  className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  placeholder="Start Year"
                  className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                  placeholder="End Year"
                  className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowPeriodForm(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {periods.map((period) => (
              <div key={period.id} className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex justify-between items-center hover:border-slate-300 transition-colors">
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">{period.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-slate-600 text-sm flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Invite Code: <span className="font-mono font-bold text-slate-900">FT1RBBT</span>
                    </p>
                    <p className="text-slate-600 text-sm flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Students: 1
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    Year: {period.start_year} BCE <span className="text-slate-400">|</span> Status: Paused
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    View
                  </button>
                  <button
                    onClick={() => handleDeletePeriod(period.id)}
                    className="bg-slate-200 hover:bg-red-50 text-slate-600 hover:text-red-600 p-2 rounded-lg transition-colors"
                    title="Delete Period"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showInviteForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInviteForm(false)}
          >
            <div
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Generate Invite Code</h3>
              <form onSubmit={handleGenerateInvite}>
                <button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg mb-2 transition-colors font-medium shadow-sm"
                >
                  Generate Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Invite Codes */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-slate-700" />
            Invite Codes
          </h2>
          <div className="space-y-2">
            {inviteCodes.map((code) => (
              <div key={code.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-900 font-mono text-lg font-bold">{code.code}</span>
                  <span className="text-slate-600 ml-4">({code.period_name})</span>
                </div>
                <span className="text-slate-600 text-sm">
                  {code.current_uses}/{code.max_uses || '∞'} uses
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-700" />
            Students
          </h2>
          <div className="space-y-2">
            {students.map((student) => (
              <div key={student.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-900 font-medium">{student.name}</span>
                  <span className="text-slate-600 ml-4">@{student.username}</span>
                </div>
                <span className="text-slate-600 text-sm">{student.period_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
