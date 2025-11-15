import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';
import { AuthLayout } from '../components/templates';
import { LoginForm } from '../components/organisms';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.login(data);
      
      dispatch(setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));
      
      // Redirect based on role
      switch (response.data.user.role) {
        case 'superadmin':
          navigate('/superadmin/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your LMS account"
    >
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </AuthLayout>
  );
};

export default Login;

