import React from 'react';
import { DashboardLayout } from '../../components/templates';
import { Card } from '../../components/atoms';

const StudentDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your learning progress</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrolled Courses</h3>
            <p className="text-3xl font-bold text-primary-600">8</p>
            <p className="text-sm text-gray-500 mt-1">4 in progress, 4 completed</p>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificates</h3>
            <p className="text-3xl font-bold text-primary-600">4</p>
            <p className="text-sm text-gray-500 mt-1">Courses completed</p>
          </Card>
          
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Progress</h3>
            <p className="text-3xl font-bold text-primary-600">67%</p>
            <p className="text-sm text-gray-500 mt-1">Keep going!</p>
          </Card>
        </div>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Introduction to React</h4>
                <span className="text-sm text-primary-600">45% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Advanced TypeScript</h4>
                <span className="text-sm text-primary-600">78% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Web Development Basics</h4>
                <span className="text-sm text-primary-600">23% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;

