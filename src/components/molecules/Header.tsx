import React, { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { authApi } from '../../api/authApi';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';
import { 
  Bars3Icon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, refreshToken } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user profile untuk get profile image
  const { data: profileData } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userApi.getProfile,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Call backend to revoke session
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
      
      // Clear local state
      dispatch(logout());
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Even if backend call fails, still logout locally
      dispatch(logout());
      navigate('/login');
      
      toast.error(error.response?.data?.message || 'Logged out (session may still be active)');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">LMS</h1>
              <p className="text-xs text-gray-500 capitalize">{user?.role} Panel</p>
            </div>
          </div>
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              {profileData?.data?.profileImage ? (
                <img
                  src={profileData.data.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full text-white font-semibold">
                  {user?.email.charAt(0).toUpperCase()}
                </div>
              )}
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-3">
                    {profileData?.data?.profileImage ? (
                      <img
                        src={profileData.data.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full text-white font-semibold">
                        {user?.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/profile')}
                        className={clsx(
                          'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md mt-2',
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        )}
                      >
                        <UserIcon className="h-5 w-5" />
                        <span>Profile & Sessions</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/settings')}
                        className={clsx(
                          'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md',
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        )}
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        <span>Settings</span>
                      </button>
                    )}
                  </Menu.Item>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className={clsx(
                            'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors',
                            active ? 'bg-red-50 text-red-700' : 'text-red-600',
                            isLoggingOut && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <ArrowRightOnRectangleIcon className={clsx(
                            'h-5 w-5',
                            isLoggingOut && 'animate-spin'
                          )} />
                          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;

