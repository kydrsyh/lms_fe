import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/templates';
import { Card, Button } from '../../components/atoms';
import {
  CogIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Application Settings',
      description: 'Manage feature flags, integrations, and system configurations for client deployments',
      icon: CogIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => navigate('/developer/settings'),
    },
    {
      title: 'Two-Factor Authentication',
      description: 'Secure your developer account with Google Authenticator 2FA',
      icon: ShieldCheckIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => navigate('/developer/2fa'),
    },
    {
      title: 'Audit Logs',
      description: 'View detailed logs of all system changes and user actions',
      icon: ClipboardDocumentListIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => navigate('/developer/audit-logs'),
    },
  ];

  return (
    <DashboardLayout title="Developer Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Developer Portal</h1>
          <p className="text-slate-200">
            Manage application settings, security configurations, and monitor system activity
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {feature.description}
                  </p>
                  <Button
                    variant="primary"
                    onClick={feature.action}
                    className="w-full"
                  >
                    Manage
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="text-sm text-slate-600 mb-1">Environment</div>
              <div className="text-2xl font-bold text-slate-900">
                {import.meta.env.MODE || 'Development'}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-sm text-slate-600 mb-1">API Version</div>
              <div className="text-2xl font-bold text-slate-900">v1.0.0</div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-sm text-slate-600 mb-1">Database</div>
              <div className="text-2xl font-bold text-slate-900">PostgreSQL</div>
            </div>
          </Card>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Developer Access Notice
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Changes to application settings and configurations will affect all users.
                  Please ensure you test thoroughly before deploying to production.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;

