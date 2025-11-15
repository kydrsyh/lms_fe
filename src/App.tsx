import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setCredentials } from './store/slices/authSlice';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import SuperadminDashboard from './pages/superadmin/Dashboard';
import UserManagement from './pages/superadmin/UserManagement';
import SessionManagement from './pages/superadmin/SessionManagement';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/Profile';
import Finance from './pages/Finance';
import ErrorBoundary from './components/organisms/ErrorBoundary';
import { Toast } from './components/atoms';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  // Restore auth state from localStorage on app load
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    
    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setCredentials({ user, accessToken, refreshToken }));
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.clear();
      }
    }
  }, [dispatch]);
  
  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);
  
  return (
    <ErrorBoundary>
      <Toast />
      <BrowserRouter>
        <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${user?.role}/dashboard`} replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected Routes - Superadmin */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperadminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/users"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/sessions"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SessionManagement />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Teacher */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Routes - Student */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Profile & Sessions - All roles except superadmin */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* Finance - Superadmin and Admin only */}
        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <Finance />
            </ProtectedRoute>
          }
        />
        
        {/* Default Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={`/${user?.role}/dashboard`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

