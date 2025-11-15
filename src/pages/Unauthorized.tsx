import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/atoms';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">403</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;

