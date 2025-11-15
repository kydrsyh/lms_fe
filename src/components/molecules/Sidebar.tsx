import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  BanknotesIcon,
  BookOpenIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<'superadmin' | 'admin' | 'teacher' | 'student'>;
  badge?: string;
}

const getSidebarItems = (role: string): SidebarItem[] => [
  {
    name: 'Dashboard',
    path: `/${role}/dashboard`,
    icon: HomeIcon,
    roles: ['superadmin', 'admin', 'teacher', 'student']
  },
  {
    name: 'User Management',
    path: '/superadmin/users',
    icon: UsersIcon,
    roles: ['superadmin']
  },
  {
    name: 'Session Management',
    path: '/superadmin/sessions',
    icon: ShieldCheckIcon,
    roles: ['superadmin']
  },
  {
    name: 'Profile & Sessions',
    path: '/profile',
    icon: UserCircleIcon,
    roles: ['admin', 'teacher', 'student']
  },
  {
    name: 'Finance',
    path: '/finance',
    icon: BanknotesIcon,
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Courses',
    path: '/courses',
    icon: BookOpenIcon,
    roles: ['superadmin', 'admin', 'teacher']
  },
  {
    name: 'My Courses',
    path: '/student/courses',
    icon: AcademicCapIcon,
    roles: ['student']
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Cog6ToothIcon,
    roles: ['superadmin', 'admin', 'teacher', 'student']
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  
  const sidebarItems = user?.role ? getSidebarItems(user.role) : [];
  const filteredItems = sidebarItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button (mobile only) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">LMS</h2>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className={clsx('h-5 w-5', isActive ? 'text-primary-600' : 'text-gray-400')} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="p-3 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg">
            <p className="text-xs font-medium text-gray-900">Need Help?</p>
            <p className="text-xs text-gray-600 mt-1">Check our documentation</p>
            <button className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700">
              Learn More →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
