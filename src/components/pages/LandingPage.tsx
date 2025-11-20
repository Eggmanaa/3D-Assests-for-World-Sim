import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Clock, GraduationCap, Users, Sparkles, Target, Brain, Trophy } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg/2560px-Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg")'
      }}
    >
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden">

        {/* Header Section */}
        <div className="text-center pt-10 pb-8 px-6">
          <div className="flex justify-center items-center gap-3 mb-2">
            <div className="bg-slate-800 p-2 rounded-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              Through History
            </h1>
          </div>

          <p className="text-lg text-slate-600 mb-2">
            A World History Simulation Game for High School Students
          </p>
          <p className="text-sm text-slate-400">
            Build civilizations, manage resources, and survive from 50,000 BCE to 362 CE
          </p>
        </div>

        {/* Split Sections */}
        <div className="grid md:grid-cols-2 gap-6 px-8 pb-8">

          {/* Teacher Section */}
          <div className="bg-red-50 rounded-xl p-8 border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-8 h-8 text-red-800" />
              <h2 className="text-2xl font-bold text-red-900">Teachers</h2>
            </div>

            <p className="text-red-700/80 mb-8 text-sm leading-relaxed">
              Create periods, manage students, and control the timeline
            </p>

            <div className="space-y-3">
              <Link
                to="/teacher/login"
                className="block w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors shadow-sm"
              >
                Teacher Login
              </Link>

              <Link
                to="/teacher/register"
                className="block w-full bg-white hover:bg-red-50 text-red-700 font-bold py-3 px-6 rounded-lg text-center border border-red-200 transition-colors shadow-sm"
              >
                Register as Teacher
              </Link>
            </div>
          </div>

          {/* Student Section */}
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-800" />
              <h2 className="text-2xl font-bold text-blue-900">Students</h2>
            </div>

            <p className="text-blue-700/80 mb-8 text-sm leading-relaxed">
              Build your civilization and compete with classmates
            </p>

            <div className="space-y-3">
              <Link
                to="/student/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors shadow-sm"
              >
                Student Login
              </Link>

              <Link
                to="/student/join"
                className="block w-full bg-white hover:bg-blue-50 text-blue-600 font-bold py-3 px-6 rounded-lg text-center border border-blue-200 transition-colors shadow-sm"
              >
                Join with Invite Code
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-slate-800 rounded-full p-1">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h3 className="font-bold text-slate-800">About the Game</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">30,362</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Years of History</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">18+</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Historical Civilizations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">∞</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Strategic Possibilities</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
