import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../atoms';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface Permissions {
  finance?: Permission;
  department?: Permission;
  courses?: Permission;
  users?: Permission;
}

interface PermissionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: Permissions) => void;
  currentPermissions: Permissions | null;
  userEmail: string;
  isLoading?: boolean;
}

const PermissionEditor: React.FC<PermissionEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPermissions,
  userEmail,
  isLoading = false,
}) => {
  const [permissions, setPermissions] = useState<Permissions>({
    finance: { view: false, create: false, edit: false, delete: false },
    department: { view: false, create: false, edit: false, delete: false },
    courses: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
  });

  useEffect(() => {
    if (currentPermissions) {
      setPermissions({
        finance: currentPermissions.finance || { view: false, create: false, edit: false, delete: false },
        department: currentPermissions.department || { view: false, create: false, edit: false, delete: false },
        courses: currentPermissions.courses || { view: false, create: false, edit: false, delete: false },
        users: currentPermissions.users || { view: false, create: false, edit: false, delete: false },
      });
    }
  }, [currentPermissions]);

  const handlePermissionChange = (resource: keyof Permissions, action: keyof Permission) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action],
      },
    }));
  };

  const handleSelectAll = (resource: keyof Permissions) => {
    const allTrue = Object.values(permissions[resource] || {}).every((v) => v);
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        view: !allTrue,
        create: !allTrue,
        edit: !allTrue,
        delete: !allTrue,
      },
    }));
  };

  const handleSave = () => {
    onSave(permissions);
  };

  const resources = [
    { key: 'finance' as keyof Permissions, label: 'Finance', icon: '💰', color: 'green' },
    { key: 'department' as keyof Permissions, label: 'Department', icon: '🏢', color: 'blue' },
    { key: 'courses' as keyof Permissions, label: 'Courses', icon: '📚', color: 'purple' },
    { key: 'users' as keyof Permissions, label: 'Users', icon: '👥', color: 'orange' },
  ];

  const actions: Array<keyof Permission> = ['view', 'create', 'edit', 'delete'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Permissions" size="xl">
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Editing permissions for:</p>
              <p className="text-sm text-blue-700">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Permission Grid */}
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.key} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className={`bg-${resource.color}-50 px-4 py-3 border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{resource.icon}</span>
                    <h3 className="text-sm font-semibold text-gray-900">{resource.label}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(resource.key)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Toggle All
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {actions.map((action) => (
                    <label
                      key={action}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={permissions[resource.key]?.[action] || false}
                        onChange={() => handlePermissionChange(resource.key, action)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Warning:</strong> Changing permissions will revoke all user sessions and force them to re-login.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isLoading} disabled={isLoading}>
            Save Permissions
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PermissionEditor;

