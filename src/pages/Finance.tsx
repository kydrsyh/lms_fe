import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../api/financeApi';
import DashboardLayout from '../components/templates/DashboardLayout';
import { Button, Alert, ConfirmDialog } from '../components/atoms';
import { 
  BanknotesIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Finance: React.FC = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Test VIEW permission
  const { data, isLoading, error } = useQuery({
    queryKey: ['finance'],
    queryFn: financeApi.getFinanceData,
  });

  // Test CREATE permission
  const createMutation = useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: (data) => {
      toast.success(`Transaction created: ${data.transaction}`);
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error('❌ You don\'t have CREATE permission for Finance');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create transaction');
      }
    },
  });

  // Test EDIT permission
  const editMutation = useMutation({
    mutationFn: (id: number) => financeApi.updateTransaction(id),
    onSuccess: (data) => {
      toast.success(`Transaction updated: ${data.transaction}`);
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error('❌ You don\'t have EDIT permission for Finance');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update transaction');
      }
    },
  });

  // Test DELETE permission
  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeApi.deleteTransaction(id),
    onSuccess: (data) => {
      toast.success(`Transaction deleted: ${data.transaction}`);
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error('❌ You don\'t have DELETE permission for Finance');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete transaction');
      }
    },
  });

  const handleCreate = () => {
    createMutation.mutate();
  };

  const handleEdit = () => {
    if (data?.id) {
      editMutation.mutate(data.id);
    }
  };

  const handleDelete = () => {
    if (data?.id) {
      deleteMutation.mutate(data.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Test your finance permissions (view, create, edit, delete)
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={createMutation.isPending}
            leftIcon={<PlusIcon />}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Transaction'}
          </Button>
        </div>

        {/* Permission Info Alert */}
        <Alert
          variant="info"
          title="Permission Testing"
          message="This page tests your finance permissions. Try clicking the buttons to see which actions you can perform based on your role."
        />

        {/* Error State */}
        {error && (
          <Alert
            variant="error"
            title="Access Denied"
            message={
              (error as any).response?.status === 403
                ? "❌ You don't have VIEW permission for Finance. Contact your administrator."
                : (error as any).message || 'Failed to load finance data'
            }
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading finance data...</p>
          </div>
        )}

        {/* Finance Dashboard */}
        {data && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${data.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Expenses</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${data.expenses.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <BanknotesIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Profit</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${data.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Report Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Financial Report</h2>
              </div>

              <div className="px-6 py-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700">{data.report}</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditDialogOpen(true)}
                    disabled={editMutation.isPending}
                    leftIcon={<PencilIcon />}
                  >
                    Edit Report
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleteMutation.isPending}
                    leftIcon={<TrashIcon />}
                  >
                    Delete Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Permission Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                ✅ Your Finance Permissions:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>View:</strong> ✅ Yes (you can see this page)</li>
                <li>• <strong>Create:</strong> Try clicking "Create Transaction" button</li>
                <li>• <strong>Edit:</strong> Try clicking "Edit Report" button</li>
                <li>• <strong>Delete:</strong> Try clicking "Delete Report" button</li>
              </ul>
            </div>
          </>
        )}

        {/* Edit Dialog */}
        <ConfirmDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onConfirm={handleEdit}
          title="Edit Financial Report"
          message="Are you sure you want to edit this financial report? This will test your EDIT permission."
          type="info"
          confirmText="Edit"
          isLoading={editMutation.isPending}
        />

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Financial Report"
          message="Are you sure you want to delete this financial report? This will test your DELETE permission."
          type="danger"
          confirmText="Delete"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
};

export default Finance;

