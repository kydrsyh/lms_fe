import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import DashboardLayout from '../components/templates/DashboardLayout';
import { Button, ConfirmDialog, Modal, ImageUploader } from '../components/atoms';
import { format } from 'date-fns';
import { 
  TrashIcon, 
  ComputerDesktopIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  GlobeAltIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Device {
  id: number;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user, refreshToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);

  // Fetch user profile
  const { data: profileData } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userApi.getProfile,
  });

  // Fetch devices
  const { data: devices, isLoading } = useQuery({
    queryKey: ['my-devices'],
    queryFn: authApi.getDevices,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Revoke device mutation
  const revokeMutation = useMutation({
    mutationFn: authApi.revokeDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-devices'] });
      toast.success('Session revoked successfully');
      setRevokeDialogOpen(false);
      setSelectedDevice(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    },
  });

  // Logout all mutation
  const logoutAllMutation = useMutation({
    mutationFn: authApi.logoutAll,
    onSuccess: () => {
      dispatch(logout());
      navigate('/login');
      toast.success('Logged out from all devices');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to logout from all devices');
    },
  });

  // Delete profile image mutation
  const deleteImageMutation = useMutation({
    mutationFn: userApi.deleteProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile image deleted successfully');
      setDeleteImageDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete profile image');
    },
  });

  const handleRevokeClick = (device: Device) => {
    setSelectedDevice(device);
    setRevokeDialogOpen(true);
  };

  const handleConfirmRevoke = () => {
    if (selectedDevice) {
      revokeMutation.mutate(selectedDevice.id);
    }
  };

  const handleLogoutAllClick = () => {
    setLogoutAllDialogOpen(true);
  };

  const handleConfirmLogoutAll = () => {
    logoutAllMutation.mutate();
  };

  const handleUploadSuccess = async (result: { fileKey: string; publicUrl: string }) => {
    try {
      await userApi.updateProfileImage(result.publicUrl, result.fileKey);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile image updated successfully');
      setImageUploadModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile image');
    }
  };

  const handleDeleteImage = () => {
    setDeleteImageDialogOpen(true);
  };

  const handleConfirmDeleteImage = () => {
    deleteImageMutation.mutate();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      case 'student':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    if (deviceInfo.toLowerCase().includes('mobile')) {
      return '📱';
    } else if (deviceInfo.toLowerCase().includes('tablet')) {
      return '📱';
    }
    return '💻';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile & Sessions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile information and active sessions
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 relative">
                  {profileData?.data?.profileImage ? (
                    <img
                      src={profileData.data.profileImage}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <UserCircleIcon className="h-20 w-20 text-white" />
                  )}
                </div>
                <div className="ml-6 text-white">
                  <h2 className="text-2xl font-bold">{user?.email}</h2>
                  <div className="mt-2 flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                        user?.role || ''
                      )}`}
                    >
                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUploadModalOpen(true)}
                  leftIcon={<PencilIcon />}
                  className="bg-white text-primary-600 hover:bg-gray-50"
                >
                  {profileData?.data?.profileImage ? 'Change' : 'Upload'} Photo
                </Button>
                {profileData?.data?.profileImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteImage}
                    leftIcon={<TrashIcon />}
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          </div>

          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Permissions</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.permissions ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(user.permissions).map(([resource, perms]: [string, any]) => (
                        <div key={resource} className="bg-gray-50 rounded-lg p-2">
                          <span className="font-medium text-gray-700 capitalize">{resource}: </span>
                          <span className="text-gray-600">
                            {Object.entries(perms)
                              .filter(([_, value]) => value)
                              .map(([action]) => action)
                              .join(', ') || 'none'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">
                      {user?.role === 'superadmin' ? 'Full Access' : 'Role-based access'}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sessions Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your active sessions across devices
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogoutAllClick}
              disabled={!devices || devices.length === 0}
            >
              Logout All Devices
            </Button>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading sessions...</p>
            </div>
          ) : devices && devices.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {devices.map((device) => (
                <div key={device.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="text-4xl">{getDeviceIcon(device.deviceInfo)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {device.deviceInfo}
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <GlobeAltIcon className="h-4 w-4 mr-1" />
                            {device.ipAddress}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {format(new Date(device.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeClick(device)}
                      leftIcon={<TrashIcon />}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any active sessions.
              </p>
            </div>
          )}
        </div>

        {/* Revoke Session Dialog */}
        <ConfirmDialog
          isOpen={revokeDialogOpen}
          onClose={() => {
            setRevokeDialogOpen(false);
            setSelectedDevice(null);
          }}
          onConfirm={handleConfirmRevoke}
          title="Revoke Session"
          message={
            selectedDevice
              ? `Are you sure you want to revoke this session from ${selectedDevice.deviceInfo}? If this is your current session, you will be logged out.`
              : ''
          }
          type="warning"
          confirmText="Revoke"
          isLoading={revokeMutation.isPending}
        />

        {/* Logout All Dialog */}
        <ConfirmDialog
          isOpen={logoutAllDialogOpen}
          onClose={() => setLogoutAllDialogOpen(false)}
          onConfirm={handleConfirmLogoutAll}
          title="Logout from All Devices"
          message="Are you sure you want to logout from all devices? You will be logged out immediately and will need to login again."
          type="danger"
          confirmText="Logout All"
          isLoading={logoutAllMutation.isPending}
        />

        {/* Image Upload Modal */}
        <Modal
          isOpen={imageUploadModalOpen}
          onClose={() => setImageUploadModalOpen(false)}
          title="Upload Profile Photo"
        >
          <ImageUploader
            onUploadSuccess={handleUploadSuccess}
            folder="profile-images"
            existingImageUrl={profileData?.data?.profileImage || undefined}
            maxSizeMB={2}
          />
        </Modal>

        {/* Delete Image Dialog */}
        <ConfirmDialog
          isOpen={deleteImageDialogOpen}
          onClose={() => setDeleteImageDialogOpen(false)}
          onConfirm={handleConfirmDeleteImage}
          title="Delete Profile Photo"
          message="Are you sure you want to delete your profile photo?"
          type="warning"
          confirmText="Delete"
          isLoading={deleteImageMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
};

export default Profile;

