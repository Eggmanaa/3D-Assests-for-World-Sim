import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Clock, GraduationCap, Users, Sparkles, Target, Brain, Trophy } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-6">
            <Globe className="w-16 h-16 text-amber-400 animate-pulse" />
            <Clock className="w-16 h-16 text-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            Through <span className="text-amber-400">History</span>
          </h1>
          
          <p className="text-2xl text-amber-200 mb-4">
            A World History Simulation Game for High School Students
          </p>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Build civilizations, manage resources, and survive from 50,000 BCE to 362 CE. 
            Make strategic decisions that shape the course of history.
          </p>
        </div>
        
        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Teacher Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-amber-400/30 hover:border-amber-400 transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="w-20 h-20 text-amber-400" />
            </div>
            
            <h2 className="text-3xl font-bold text-white text-center mb-4">Teachers</h2>
            
            <p className="text-gray-300 text-center mb-6">
              Create periods, manage students, and guide them through history
            </p>
            
            <div className="space-y-3">
              <Link
                to="/teacher/login"
                className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Login
              </Link>
              
              <Link
                to="/teacher/register"
                className="block w-full bg-transparent hover:bg-white/10 text-amber-400 font-bold py-3 px-6 rounded-lg text-center border-2 border-amber-400 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
          
          {/* Student Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-blue-400/30 hover:border-blue-400 transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Users className="w-20 h-20 text-blue-400" />
            </div>
            
            <h2 className="text-3xl font-bold text-white text-center mb-4">Students</h2>
            
            <p className="text-gray-300 text-center mb-6">
              Join your class and embark on an epic journey through ancient civilizations
            </p>
            
            <div className="space-y-3">
              <Link
                to="/student/login"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                Login
              </Link>
              
              <Link
                to="/student/join"
                className="block w-full bg-transparent hover:bg-white/10 text-blue-400 font-bold py-3 px-6 rounded-lg text-center border-2 border-blue-400 transition-colors"
              >
                Join with Invite Code
              </Link>
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10">
            <div className="text-4xl font-bold text-amber-400 mb-2">30,362</div>
            <div className="text-gray-300">Years of History</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10">
            <div className="text-4xl font-bold text-amber-400 mb-2">18+</div>
            <div className="text-gray-300">Historical Civilizations</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10">
            <div className="text-4xl font-bold text-amber-400 mb-2">∞</div>
            <div className="text-gray-300">Strategic Possibilities</div>
          </div>
        </div>
        
        {/* Features */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-8">Game Features</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Sparkles className="w-12 h-12 text-amber-400 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Build Civilizations</h4>
              <p className="text-gray-400">Choose from 18+ historical civilizations with unique traits</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Target className="w-12 h-12 text-amber-400 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Manage Resources</h4>
              <p className="text-gray-400">Balance food, production, population, and water</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Brain className="w-12 h-12 text-amber-400 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Strategic Decisions</h4>
              <p className="text-gray-400">Face historical events and make impactful choices</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Trophy className="w-12 h-12 text-amber-400 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Compete & Learn</h4>
              <p className="text-gray-400">Track progress and compete with classmates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
