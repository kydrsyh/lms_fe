import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  PaginationState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { sessionApi, SessionData, SessionFilters } from '../../api/sessionApi';
import DashboardLayout from '../../components/templates/DashboardLayout';
import { 
  Button, 
  ConfirmDialog, 
  Card, 
  Dropdown,
  FilterPopover,
  SearchPopover 
} from '../../components/atoms';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandler';
import { format } from 'date-fns';
import { 
  TrashIcon, 
  ComputerDesktopIcon,
  UserCircleIcon,
  ClockIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const SessionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [revokeAllUserId, setRevokeAllUserId] = useState<number | null>(null);

  // Server-side state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Debounce filters
  const [debouncedFilters, setDebouncedFilters] = useState(columnFilters);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(columnFilters);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [columnFilters]);

  // Build filters for API
  const filters: SessionFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting[0]?.id || 'createdAt',
    sortOrder: sorting[0]?.desc ? 'DESC' : 'ASC',
    search: (debouncedFilters.find((f) => f.id === 'email')?.value as string) || '',
    role: (debouncedFilters.find((f) => f.id === 'role')?.value as string) || '',
    deviceType: (debouncedFilters.find((f) => f.id === 'deviceInfo')?.value as string) || '',
  };

  // Fetch sessions
  const { 
    data: response, 
    isLoading, 
    isFetching 
  } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => sessionApi.getAllSessions(filters),
    keepPreviousData: true,
    refetchInterval: 30000, // Refresh every 30 seconds
    onError: (error) => {
      showErrorToast(error, 'Failed to load sessions');
    },
  });

  const sessions = response?.data || [];
  const paginationMeta = response?.pagination;

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['session-stats'],
    queryFn: sessionApi.getSessionStats,
    refetchInterval: 30000,
  });

  // Revoke single session
  const revokeMutation = useMutation({
    mutationFn: sessionApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
      showSuccessToast('Session revoked successfully');
      setRevokeDialogOpen(false);
      setSelectedSession(null);
    },
    onError: (error: any) => {
      showErrorToast(error, 'Failed to revoke session');
    },
  });

  // Revoke all user sessions
  const revokeAllMutation = useMutation({
    mutationFn: sessionApi.revokeUserSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
      showSuccessToast('All user sessions revoked successfully');
      setRevokeDialogOpen(false);
      setRevokeAllUserId(null);
    },
    onError: (error: any) => {
      showErrorToast(error, 'Failed to revoke user sessions');
    },
  });

  const handleRevokeClick = (session: SessionData) => {
    setSelectedSession(session);
    setRevokeAllUserId(null);
    setRevokeDialogOpen(true);
  };

  const handleRevokeAllClick = (userId: number) => {
    setRevokeAllUserId(userId);
    setSelectedSession(null);
    setRevokeDialogOpen(true);
  };

  const handleConfirmRevoke = () => {
    if (selectedSession) {
      revokeMutation.mutate(selectedSession.id);
    } else if (revokeAllUserId) {
      revokeAllMutation.mutate(revokeAllUserId);
    }
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

  // Define columns
  const columns = useMemo<ColumnDef<SessionData>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 70,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="text-sm text-gray-900 font-medium">#{info.getValue() as number}</span>
        ),
      },
      {
        id: 'email',
        accessorFn: (row) => row.user.email,
        header: 'User',
        size: 250,
        enableColumnFilter: true,
        cell: (info) => {
          const session = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{session.user.email}</span>
              <span
                className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getRoleBadgeColor(
                  session.user.role
                )}`}
              >
                {session.user.role}
              </span>
            </div>
          );
        },
      },
      {
        id: 'role',
        accessorFn: (row) => row.user.role,
        header: 'Role',
        size: 120,
        enableColumnFilter: true,
        cell: (info) => {
          const role = info.getValue() as string;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                role
              )}`}
            >
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: 'deviceInfo',
        header: 'Device',
        size: 150,
        enableColumnFilter: true,
        cell: (info) => {
          const deviceInfo = info.getValue() as string;
          return (
            <span className="text-sm text-gray-900">
              {getDeviceIcon(deviceInfo)} {deviceInfo}
            </span>
          );
        },
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        size: 140,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="text-sm text-gray-600 font-mono">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        size: 130,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {format(new Date(info.getValue() as string), 'MMM dd, HH:mm')}
          </span>
        ),
      },
      {
        accessorKey: 'expiresAt',
        header: 'Expires',
        size: 130,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {format(new Date(info.getValue() as string), 'MMM dd, HH:mm')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 80,
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => {
          const session = info.row.original;
          return (
            <Dropdown
              items={[
                {
                  label: 'Revoke Session',
                  onClick: () => handleRevokeClick(session),
                  icon: <TrashIcon className="h-4 w-4" />,
                  variant: 'danger',
                },
                {
                  label: 'Revoke All User Sessions',
                  onClick: () => handleRevokeAllClick(session.userId),
                  icon: <TrashIcon className="h-4 w-4" />,
                  variant: 'danger',
                },
              ]}
              align="right"
            />
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: sessions,
    columns,
    pageCount: paginationMeta?.totalPages ?? -1,
    state: {
      sorting,
      pagination,
      columnFilters,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  // Calculate pagination info
  const start = paginationMeta ? (paginationMeta.page - 1) * paginationMeta.limit + 1 : 0;
  const end = paginationMeta ? Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total) : 0;
  const total = paginationMeta?.total || 0;

  // Generate smart page numbers
  const generatePageNumbers = () => {
    if (!paginationMeta) return [];
    const { page, totalPages } = paginationMeta;
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage active user sessions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalActiveSessions}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <UserCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.uniqueActiveUsers}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.expiringSoon}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">By Role</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    SA: {stats.sessionsByRole.superadmin || 0}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    A: {stats.sessionsByRole.admin || 0}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    T: {stats.sessionsByRole.teacher || 0}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    S: {stats.sessionsByRole.student || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Sessions Table */}
        <Card>
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading sessions...</p>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="relative">
                {isFetching && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary-100 z-10 overflow-hidden">
                    <div className="h-full bg-primary-600 animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            <div className="flex items-center gap-2">
                              {/* Header Text with Sort */}
                              <div
                                className={`flex items-center gap-1 ${
                                  header.column.getCanSort()
                                    ? 'cursor-pointer hover:text-gray-700'
                                    : ''
                                }`}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <span>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </span>
                                {header.column.getCanSort() && (
                                  <span className="text-gray-400">
                                    {header.column.getIsSorted() === 'asc' ? (
                                      <ChevronUpIcon className="h-4 w-4" />
                                    ) : header.column.getIsSorted() === 'desc' ? (
                                      <ChevronDownIcon className="h-4 w-4" />
                                    ) : (
                                      <ChevronUpDownIcon className="h-4 w-4" />
                                    )}
                                  </span>
                                )}
                              </div>

                              {/* Filter/Search Icons */}
                              {header.column.getCanFilter() && (
                                <div
                                  className="flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {header.column.id === 'email' && (
                                    <SearchPopover
                                      value={(header.column.getFilterValue() ?? '') as string}
                                      onChange={(value) => header.column.setFilterValue(value)}
                                      placeholder="Search by email..."
                                    />
                                  )}

                                  {header.column.id === 'role' && (
                                    <FilterPopover
                                      value={(header.column.getFilterValue() ?? '') as string}
                                      onChange={(value) => header.column.setFilterValue(value)}
                                      placeholder="Filter by Role"
                                      hasActiveFilter={!!header.column.getFilterValue()}
                                      options={[
                                        { value: '', label: 'All Roles' },
                                        { value: 'superadmin', label: 'Superadmin' },
                                        { value: 'admin', label: 'Admin' },
                                        { value: 'teacher', label: 'Teacher' },
                                        { value: 'student', label: 'Student' },
                                      ]}
                                    />
                                  )}

                                  {header.column.id === 'deviceInfo' && (
                                    <FilterPopover
                                      value={(header.column.getFilterValue() ?? '') as string}
                                      onChange={(value) => header.column.setFilterValue(value)}
                                      placeholder="Filter by Device"
                                      hasActiveFilter={!!header.column.getFilterValue()}
                                      options={[
                                        { value: '', label: 'All Devices' },
                                        { value: 'Desktop', label: 'Desktop' },
                                        { value: 'Mobile', label: 'Mobile' },
                                        { value: 'Tablet', label: 'Tablet' },
                                      ]}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            No active sessions
                          </h3>
                          <p className="text-sm text-gray-500">
                            No users are currently logged in.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-4 lg:px-6 py-4 whitespace-nowrap"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paginationMeta && paginationMeta.total > 0 && (
                <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700 text-center sm:text-left">
                      Showing <span className="font-medium">{start}</span> to{' '}
                      <span className="font-medium">{end}</span> of{' '}
                      <span className="font-medium">{total}</span> sessions
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Previous
                      </Button>

                      {/* Page Numbers - Hidden on mobile */}
                      <div className="hidden sm:flex items-center gap-1">
                        {generatePageNumbers().map((pageNum, index) => {
                          if (pageNum === '...') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return (
                            <Button
                              key={pageNum}
                              size="sm"
                              variant={
                                paginationMeta.page === pageNum ? 'primary' : 'outline'
                              }
                              onClick={() =>
                                table.setPageIndex((pageNum as number) - 1)
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={revokeDialogOpen}
          onClose={() => {
            setRevokeDialogOpen(false);
            setSelectedSession(null);
            setRevokeAllUserId(null);
          }}
          onConfirm={handleConfirmRevoke}
          title={selectedSession ? 'Revoke Session' : 'Revoke All Sessions'}
          message={
            selectedSession
              ? `Are you sure you want to revoke this session for ${selectedSession.user.email}? The user will be logged out immediately.`
              : 'Are you sure you want to revoke all sessions for this user? They will be logged out from all devices immediately.'
          }
          isDanger
          confirmText="Revoke"
          isLoading={revokeMutation.isPending || revokeAllMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
};

export default SessionManagement;
