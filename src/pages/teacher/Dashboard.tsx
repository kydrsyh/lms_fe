import React from 'react';
import { DashboardLayout } from '../../components/templates';
import { Card } from '../../components/atoms';

const TeacherDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your courses and students</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Courses</h3>
            <p className="text-3xl font-bold text-primary-600">12</p>
            <p className="text-sm text-gray-500 mt-1">3 active, 9 completed</p>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-primary-600">245</p>
            <p className="text-sm text-gray-500 mt-1">Across all courses</p>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold text-primary-600">18</p>
            <p className="text-sm text-gray-500 mt-1">Assignments to grade</p>
          </Card>
        </div>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Active Courses</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium text-gray-900">Introduction to React</h4>
                <p className="text-sm text-gray-500">45 students enrolled</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium text-gray-900">Advanced TypeScript</h4>
                <p className="text-sm text-gray-500">32 students enrolled</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium text-gray-900">Web Development Basics</h4>
                <p className="text-sm text-gray-500">68 students enrolled</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;

