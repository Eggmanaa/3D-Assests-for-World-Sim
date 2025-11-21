import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './src/components/pages/LandingPage';
import GamePage from './src/components/pages/GamePage';
import DirectGamePage from './src/components/pages/DirectGamePage';

// Auth Components
import TeacherLogin from './src/components/auth/TeacherLogin';
import TeacherRegister from './src/components/auth/TeacherRegister';
import StudentLogin from './src/components/auth/StudentLogin';
import StudentJoin from './src/components/auth/StudentJoin';

// Dashboard Components
import TeacherDashboard from './src/components/dashboard/TeacherDashboard';
import StudentDashboard from './src/components/dashboard/StudentDashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Direct Game Route (No Auth) */}
        <Route path="/game" element={<DirectGamePage />} />

        {/* Teacher Routes */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/register" element={<TeacherRegister />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

        {/* Student Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/join" element={<StudentJoin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* Game Route (Auth) */}
        <Route path="/game/:sessionId" element={<GamePage />} />

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
