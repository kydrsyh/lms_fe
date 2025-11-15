import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ variant, title, message, onClose, className }) => {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      message: 'text-green-700',
      IconComponent: CheckCircleIcon,
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      message: 'text-red-700',
      IconComponent: ExclamationCircleIcon,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      IconComponent: ExclamationTriangleIcon,
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
      IconComponent: InformationCircleIcon,
    },
  };

  const config = variants[variant];
  const Icon = config.IconComponent;

  return (
    <div className={clsx(
      'border rounded-lg p-4',
      config.container,
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', config.icon)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-medium', config.title)}>
              {title}
            </h3>
          )}
          <div className={clsx('text-sm', title ? 'mt-2' : '', config.message)}>
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.icon,
                'hover:bg-black hover:bg-opacity-10'
              )}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;

