import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mt-4">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

