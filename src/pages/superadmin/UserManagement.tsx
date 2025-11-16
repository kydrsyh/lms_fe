import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  PaginationState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { DashboardLayout } from "../../components/templates";
import {
  Card,
  Button,
  Dropdown,
  FilterPopover,
  SearchPopover,
} from "../../components/atoms";
import { userApi, UserData, UserFilters } from "../../api/userApi";
import PermissionEditor from "../../components/organisms/PermissionEditor";
import { format } from "date-fns";
import { showErrorToast, showSuccessToast } from "../../utils/errorHandler";
import {
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();

  // Server-side state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Local state
  const [permissionEditorOpen, setPermissionEditorOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);

  // Debounce filters
  const [debouncedFilters, setDebouncedFilters] = useState(columnFilters);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(columnFilters);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page on filter change
    }, 300);
    return () => clearTimeout(timer);
  }, [columnFilters]);

  // Build filters for API
  const filters: UserFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting[0]?.id || "createdAt",
    sortOrder: sorting[0]?.desc ? "DESC" : "ASC",
    search:
      (debouncedFilters.find((f) => f.id === "email")?.value as string) || "",
    role:
      (debouncedFilters.find((f) => f.id === "role")?.value as string) || "",
    isActive:
      (debouncedFilters.find((f) => f.id === "isActive")?.value as string) ||
      "",
  };

  // Fetch users
  const {
    data: usersResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => userApi.getAll(filters),
  });

  // Fetch stats
  const { data: statsResponse } = useQuery({
    queryKey: ["userStats"],
    queryFn: userApi.getStats,
  });

  // Toggle user access mutation
  const toggleMutation = useMutation({
    mutationFn: userApi.toggleAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      showSuccessToast("User access updated successfully");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update user access");
    },
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: ({
      userId,
      permissions,
    }: {
      userId: number;
      permissions: any;
    }) => userApi.updatePermissions(userId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setPermissionEditorOpen(false);
      setUserToEdit(null);
      showSuccessToast("Permissions updated successfully. User must re-login.");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update permissions");
    },
  });

  const handleToggleAccess = (userId: number) => {
    toggleMutation.mutate(userId);
  };

  const handleEditPermissions = (user: UserData) => {
    setUserToEdit(user);
    setPermissionEditorOpen(true);
  };

  const handleSavePermissions = (permissions: any) => {
    if (userToEdit) {
      updatePermissionsMutation.mutate({
        userId: userToEdit.id,
        permissions,
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: "bg-purple-100 text-purple-800 border-purple-200",
      admin: "bg-blue-100 text-blue-800 border-blue-200",
      teacher: "bg-green-100 text-green-800 border-green-200",
      student: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Safely extract users, pagination, and stats with correct type checks
  const users =
    usersResponse &&
    typeof usersResponse === "object" &&
    "data" in usersResponse
      ? (usersResponse as { data: UserData[] }).data
      : [];
  const paginationMeta =
    usersResponse &&
    typeof usersResponse === "object" &&
    "pagination" in usersResponse
      ? (usersResponse as { pagination: any }).pagination
      : undefined;
  const stats =
    statsResponse &&
    typeof statsResponse === "object" &&
    "data" in statsResponse
      ? (statsResponse as { data: any }).data
      : undefined;

  // Define columns
  const columns = useMemo<ColumnDef<UserData>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="text-gray-900 font-medium">
            #{info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 250,
        enableColumnFilter: true,
        cell: (info) => (
          <div className="text-sm font-medium text-gray-900">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 140,
        enableColumnFilter: true,
        cell: (info) => {
          const role = info.getValue() as string;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                role
              )}`}
            >
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        size: 200,
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => {
          const user = info.row.original;
          if (user.role === "admin") {
            if (user.permissions && Object.keys(user.permissions).length > 0) {
              return (
                <div className="flex flex-wrap gap-1">
                  {Object.keys(user.permissions)
                    .slice(0, 3)
                    .map((resource) => (
                      <span
                        key={resource}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {resource}
                      </span>
                    ))}
                  {Object.keys(user.permissions).length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{Object.keys(user.permissions).length - 3} more
                    </span>
                  )}
                </div>
              );
            }
            return (
              <span className="text-xs text-gray-400 italic">
                No permissions
              </span>
            );
          }
          return (
            <span className="text-xs text-gray-400 italic">
              {user.role === "superadmin" ? "Full access" : "Role-based"}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        size: 120,
        enableColumnFilter: true,
        cell: (info) => {
          const isActive = info.getValue() as boolean;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isActive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {isActive ? "● Active" : "○ Inactive"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        size: 140,
        enableColumnFilter: false,
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {format(new Date(info.getValue() as string), "MMM dd, yyyy")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 80,
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => {
          const user = info.row.original;

          const dropdownItems = [];

          if (user.role === "admin") {
            dropdownItems.push({
              label: "Edit Permissions",
              onClick: () => handleEditPermissions(user),
              icon: <PencilIcon className="h-5 w-5" />,
              variant: "default" as const,
            });
          }

          if (user.role !== "superadmin") {
            dropdownItems.push({
              label: user.isActive ? "Deactivate User" : "Activate User",
              onClick: () => handleToggleAccess(user.id),
              icon: user.isActive ? (
                <XCircleIcon className="h-5 w-5" />
              ) : (
                <CheckCircleIcon className="h-5 w-5" />
              ),
              variant: user.isActive
                ? ("danger" as const)
                : ("default" as const),
              disabled: toggleMutation.isPending,
            });
          }

          if (dropdownItems.length === 0) {
            return (
              <span className="text-xs text-gray-400 italic">No actions</span>
            );
          }

          return <Dropdown items={dropdownItems} align="right" />;
        },
      },
    ],
    [toggleMutation.isPending]
  );

  const table = useReactTable({
    data: users,
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">
            Manage user access and permissions
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.activeUsers}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.inactiveUsers}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <span className="text-2xl">🚫</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deleted</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">
                    {stats.deletedUsers}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">🗑️</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          {/* Table Header */}
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
            <p className="text-sm text-gray-500 mt-1">
              Use column filters below to search and filter users
            </p>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto relative">
                {isFetching && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary-100 z-10">
                    <div className="h-full bg-primary-600 animate-pulse"></div>
                  </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            style={{ width: header.getSize() }}
                          >
                            <div className="flex items-center gap-2">
                              {/* Header Text with Sort */}
                              <div
                                className="flex items-center gap-1 cursor-pointer hover:text-gray-700"
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <span>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                </span>
                                {header.column.getCanSort() && (
                                  <span className="text-gray-400">
                                    {header.column.getIsSorted() === "asc" ? (
                                      <ChevronUpIcon className="h-4 w-4" />
                                    ) : header.column.getIsSorted() ===
                                      "desc" ? (
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
                                  {header.column.id === "email" && (
                                    <SearchPopover
                                      value={
                                        (header.column.getFilterValue() ??
                                          "") as string
                                      }
                                      onChange={(value) =>
                                        header.column.setFilterValue(value)
                                      }
                                      placeholder="Search by email..."
                                    />
                                  )}

                                  {header.column.id === "role" && (
                                    <FilterPopover
                                      value={
                                        (header.column.getFilterValue() ??
                                          "") as string
                                      }
                                      onChange={(value) =>
                                        header.column.setFilterValue(value)
                                      }
                                      placeholder="Filter by Role"
                                      hasActiveFilter={
                                        !!header.column.getFilterValue()
                                      }
                                      options={[
                                        { value: "", label: "All Roles" },
                                        {
                                          value: "superadmin",
                                          label: "Superadmin",
                                        },
                                        { value: "admin", label: "Admin" },
                                        { value: "teacher", label: "Teacher" },
                                        { value: "student", label: "Student" },
                                      ]}
                                    />
                                  )}

                                  {header.column.id === "isActive" && (
                                    <FilterPopover
                                      value={
                                        (header.column.getFilterValue() ??
                                          "") as string
                                      }
                                      onChange={(value) =>
                                        header.column.setFilterValue(value)
                                      }
                                      placeholder="Filter by Status"
                                      hasActiveFilter={
                                        !!header.column.getFilterValue()
                                      }
                                      options={[
                                        { value: "", label: "All Status" },
                                        { value: "true", label: "Active" },
                                        { value: "false", label: "Inactive" },
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
                          No users found
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-4 lg:px-6 py-4 whitespace-nowrap"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
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
                      Showing{" "}
                      {(paginationMeta.page - 1) * paginationMeta.limit + 1} to{" "}
                      {Math.min(
                        paginationMeta.page * paginationMeta.limit,
                        paginationMeta.total
                      )}{" "}
                      of {paginationMeta.total} users
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

                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(paginationMeta.totalPages, 5) },
                          (_, i) => {
                            let pageNum = i + 1;
                            if (paginationMeta.totalPages > 5) {
                              if (paginationMeta.page <= 3) {
                                pageNum = i + 1;
                              } else if (
                                paginationMeta.page >=
                                paginationMeta.totalPages - 2
                              ) {
                                pageNum = paginationMeta.totalPages - 4 + i;
                              } else {
                                pageNum = paginationMeta.page - 2 + i;
                              }
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => table.setPageIndex(pageNum - 1)}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                  pagination.pageIndex === pageNum - 1
                                    ? "bg-primary-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
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

        {/* Role Distribution */}
        {stats && (
          <Card>
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Users by Role
              </h3>
            </div>
            <div className="px-4 lg:px-6 py-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                    <span className="text-xl">👑</span>
                  </div>
                  <p className="text-sm text-gray-600">Superadmin</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.roleDistribution.superadmin}
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                    <span className="text-xl">👨‍💼</span>
                  </div>
                  <p className="text-sm text-gray-600">Admin</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.roleDistribution.admin}
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                    <span className="text-xl">👨‍🏫</span>
                  </div>
                  <p className="text-sm text-gray-600">Teacher</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.roleDistribution.teacher}
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                    <span className="text-xl">🎓</span>
                  </div>
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.roleDistribution.student}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Permission Editor Modal */}
        {userToEdit && (
          <PermissionEditor
            isOpen={permissionEditorOpen}
            onClose={() => {
              setPermissionEditorOpen(false);
              setUserToEdit(null);
            }}
            onSave={handleSavePermissions}
            currentPermissions={userToEdit.permissions}
            userEmail={userToEdit.email}
            isLoading={updatePermissionsMutation.isPending}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
