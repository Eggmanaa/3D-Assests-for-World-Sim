import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Ticket, User, Lock, ArrowLeft } from 'lucide-react';
import { authAPI, auth } from '../../utils/api';

const StudentJoin: React.FC = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await authAPI.studentJoin(inviteCode.toUpperCase(), username, name, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.data) {
      auth.setToken(result.data.token);
      auth.setUser(result.data.user);
      navigate('/student/dashboard');
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/images/tower-of-babel.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="max-w-md w-full relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-white hover:text-blue-300 mb-6 transition-colors drop-shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          ← Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Join a Class</h2>
          <p className="text-gray-600 text-center mb-6">Enter your teacher's invite code</p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest font-mono"
                  placeholder="ABC123"
                  required
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your_username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Joining...' : 'Join Class'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/student/login" className="text-blue-500 hover:text-blue-600 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentJoin;
