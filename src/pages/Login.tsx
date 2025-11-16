import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';
import { AuthLayout } from '../components/templates';
import { LoginForm } from '../components/organisms';
import { Modal, Button, Input } from '../components/atoms';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [credentials, setCredentialsState] = useState<{ email: string; password: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  
  const handleLoginSubmit = async (email: string, password: string, twoFactorToken?: string, backupCode?: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.login({
        email,
        password,
        twoFactorToken,
        backupCode,
      });
      
      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        setCredentialsState({ email, password });
        setShowTwoFactorModal(true);
        setIsLoading(false);
        return;
      }
      
      // If we have data, proceed with login
      if (response.data) {
        dispatch(setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        }));
        
        // Redirect based on role
        switch (response.data.user.role) {
          case 'developer':
            navigate('/developer/dashboard');
            break;
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
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async (data: { email: string; password: string }) => {
    await handleLoginSubmit(data.email, data.password);
  };
  
  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials) return;
    
    if (useBackupCode) {
      await handleLoginSubmit(credentials.email, credentials.password, undefined, twoFactorCode);
    } else {
      await handleLoginSubmit(credentials.email, credentials.password, twoFactorCode);
    }
    
    setShowTwoFactorModal(false);
    setTwoFactorCode('');
  };
  
  const handleModalClose = () => {
    setShowTwoFactorModal(false);
    setTwoFactorCode('');
    setUseBackupCode(false);
    setCredentialsState(null);
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
      
      {/* 2FA Modal */}
      <Modal
        isOpen={showTwoFactorModal}
        onClose={handleModalClose}
        title="Two-Factor Authentication"
      >
        <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            {useBackupCode 
              ? 'Enter one of your backup codes'
              : 'Enter the 6-digit code from your authenticator app'
            }
          </div>
          
          <Input
            type="text"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder={useBackupCode ? 'Backup Code' : '123456'}
            maxLength={useBackupCode ? 16 : 6}
            autoFocus
            className="text-center text-2xl tracking-widest font-mono"
          />
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={twoFactorCode.length < (useBackupCode ? 10 : 6)}
            >
              Verify
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setTwoFactorCode('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {useBackupCode ? 'Use authenticator code' : 'Use backup code instead'}
            </button>
          </div>
        </form>
      </Modal>
    </AuthLayout>
  );
};

export default Login;

