import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { AssessmentPage } from './pages/AssessmentPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { QuizPage } from './pages/QuizPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { PerformancePage } from './pages/PerformancePage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminTopics } from './pages/admin/AdminTopics';
import { AdminQuestions } from './pages/admin/AdminQuestions';
import { AdminQuizzes } from './pages/admin/AdminQuizzes';
import { AdminMaterials } from './pages/admin/AdminMaterials';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/assessment/result/:id" element={<AssessmentResultPage />} />
            <Route path="/ai-analysis" element={<AIAnalysisPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/quizzes" element={<QuizPage />} />
            <Route path="/quizzes/result/:id" element={<QuizResultPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/subjects" element={<AdminSubjects />} />
            <Route path="/admin/topics" element={<AdminTopics />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/quizzes" element={<AdminQuizzes />} />
            <Route path="/admin/materials" element={<AdminMaterials />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
