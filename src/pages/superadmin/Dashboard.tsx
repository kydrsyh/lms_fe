import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../../components/templates';
import { Card, Button } from '../../components/atoms';
import { userApi } from '../../api/userApi';

const SuperadminDashboard: React.FC = () => {
  const { data: statsResponse } = useQuery({
    queryKey: ['userStats'],
    queryFn: userApi.getStats,
  });
  
  const stats = statsResponse?.data;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Superadmin Dashboard</h2>
          <p className="text-gray-600 mt-1">Complete control panel for system administration</p>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500 mt-1">All registered users</p>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
              <p className="text-sm text-gray-500 mt-1">Currently active</p>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inactive</h3>
              <p className="text-3xl font-bold text-red-600">{stats.inactiveUsers}</p>
              <p className="text-sm text-gray-500 mt-1">Deactivated accounts</p>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deleted</h3>
              <p className="text-3xl font-bold text-gray-600">{stats.deletedUsers}</p>
              <p className="text-sm text-gray-500 mt-1">Soft deleted</p>
            </Card>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/superadmin/users">
                <Button fullWidth variant="primary">
                  👥 Manage Users
                </Button>
              </Link>
              <Button fullWidth variant="outline">
                📚 Manage Courses
              </Button>
              <Button fullWidth variant="outline">
                ⚙️ System Settings
              </Button>
            </div>
          </Card>
          
          {stats && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Superadmin</span>
                  <span className="font-bold text-purple-600">{stats.roleDistribution.superadmin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Admin</span>
                  <span className="font-bold text-blue-600">{stats.roleDistribution.admin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Teacher</span>
                  <span className="font-bold text-green-600">{stats.roleDistribution.teacher}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Student</span>
                  <span className="font-bold text-gray-600">{stats.roleDistribution.student}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">System initialized</span>
              <span className="text-sm text-gray-500">Just now</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Database migrated successfully</span>
              <span className="text-sm text-gray-500">5 minutes ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">All users seeded</span>
              <span className="text-sm text-gray-500">10 minutes ago</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperadminDashboard;

