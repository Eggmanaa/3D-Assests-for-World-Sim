import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { authAPI, auth } from '../../utils/api';

const TeacherRegister: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

    try {
      const result = await authAPI.teacherRegister(name, email, password);

      if (result.error) {
        console.error('Registration error:', result.error);
        setError(result.error);
        alert(`Registration failed: ${result.error}`);
        setLoading(false);
        return;
      }

      if (result.data) {
        console.log('Registration successful:', result.data);
        auth.setToken(result.data.token);
        auth.setUser(result.data.user);
        alert('Registration successful! Redirecting to dashboard...');
        navigate('/teacher/dashboard');
      }
    } catch (err) {
      console.error('Unexpected error during registration:', err);
      setError('An unexpected error occurred');
      alert('An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
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
          className="inline-flex items-center text-white hover:text-amber-300 mb-6 transition-colors drop-shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          ← Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Teacher Registration</h2>
          <p className="text-gray-600 text-center mb-6">Create your account</p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="teacher@school.edu"
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
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/teacher/login" className="text-red-500 hover:text-red-600 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Debug Section */}
          <div className="mt-8 p-4 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 mb-2">Debug Info</h3>
            <div className="flex space-x-2 mb-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/health');
                    const data = await res.json();
                    alert(`API Health: ${JSON.stringify(data)}`);
                  } catch (e: any) {
                    alert(`API Health Error: ${e.message}`);
                  }
                }}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Check API Health
              </button>
            </div>
            <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
              Status: {loading ? 'Submitting...' : error ? 'Error' : 'Ready'}
              {error && <div className="text-red-500 mt-1">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherRegister;
