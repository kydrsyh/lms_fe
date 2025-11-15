import React from 'react';
import { DashboardLayout } from '../../components/templates';
import { Card } from '../../components/atoms';

const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome to the admin control panel</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-primary-600">1,234</p>
            <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Courses</h3>
            <p className="text-3xl font-bold text-primary-600">45</p>
            <p className="text-sm text-gray-500 mt-1">+5 new this month</p>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrollments</h3>
            <p className="text-3xl font-bold text-primary-600">3,567</p>
            <p className="text-sm text-gray-500 mt-1">+18% from last month</p>
          </Card>
        </div>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">New user registration</span>
              <span className="text-sm text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-700">Course "React Advanced" published</span>
              <span className="text-sm text-gray-500">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">System maintenance completed</span>
              <span className="text-sm text-gray-500">3 hours ago</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

