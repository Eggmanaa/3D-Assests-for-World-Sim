import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Users, Calendar, Ticket, Clock } from 'lucide-react';
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

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-amber-400/30">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
              <p className="text-gray-300">Welcome back, {user?.name}!</p>
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

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <Users className="w-12 h-12 text-amber-400 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{stats.totalStudents}</div>
            <div className="text-gray-300">Total Students</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <Calendar className="w-12 h-12 text-amber-400 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{stats.totalPeriods}</div>
            <div className="text-gray-300">Class Periods</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <Clock className="w-12 h-12 text-amber-400 mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{stats.activeSessions}</div>
            <div className="text-gray-300">Active Sessions</div>
          </div>
        </div>

        {/* Periods */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Class Periods</h2>
            <button
              onClick={() => setShowPeriodForm(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Period
            </button>
          </div>

          {showPeriodForm && (
            <form onSubmit={handleCreatePeriod} className="bg-white/5 p-4 rounded-lg mb-4">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  placeholder="Period Name (e.g., Period 1)"
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                  required
                />
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  placeholder="Start Year"
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  required
                />
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                  placeholder="End Year"
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowPeriodForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {periods.map((period) => (
              <div key={period.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold">{period.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {period.start_year} to {period.end_year} (Current: {period.current_year})
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedPeriod(period.id); setShowInviteForm(true); }}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <Ticket className="w-4 h-4" />
                  Generate Code
                </button>
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
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Generate Invite Code</h3>
              <form onSubmit={handleGenerateInvite}>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg mb-2 transition-colors cursor-pointer"
                >
                  Generate Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Invite Codes */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Invite Codes</h2>
          <div className="space-y-2">
            {inviteCodes.map((code) => (
              <div key={code.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-white font-mono text-lg font-bold">{code.code}</span>
                  <span className="text-gray-400 ml-4">({code.period_name})</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {code.current_uses}/{code.max_uses || '∞'} uses
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Students */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Students</h2>
          <div className="space-y-2">
            {students.map((student) => (
              <div key={student.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-white font-medium">{student.name}</span>
                  <span className="text-gray-400 ml-4">@{student.username}</span>
                </div>
                <span className="text-gray-400 text-sm">{student.period_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
