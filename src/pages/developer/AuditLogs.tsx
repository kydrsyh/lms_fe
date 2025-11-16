import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Card, FilterPopover, SearchPopover } from "../../components/atoms";
import { auditLogApi, AuditLog, AuditLogFilters } from "../../api/auditLogApi";
import { format } from "date-fns";
import { showErrorToast } from "../../utils/errorHandler";
import {
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const AuditLogs: React.FC = () => {
  // Server-side state
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
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
  const filters: AuditLogFilters = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting[0]?.id || "createdAt",
    sortOrder: sorting[0]?.desc ? "DESC" : "ASC",
    search:
      (debouncedFilters.find((f) => f.id === "search")?.value as string) || "",
    resource:
      (debouncedFilters.find((f) => f.id === "resource")?.value as string) ||
      "",
    action:
      (debouncedFilters.find((f) => f.id === "action")?.value as string) || "",
  };

  // Fetch audit logs
  const {
    data: logsResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: async () => {
      try {
        return await auditLogApi.getAll(filters);
      } catch (error) {
        showErrorToast(error, "Failed to load audit logs");
        throw error;
      }
    },
  });
  const logs = logsResponse?.data || [];
  const totalCount = logsResponse?.pagination?.total || 0;
  const pageCount = logsResponse?.pagination?.totalPages || 0;

  // Define columns
  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-2 hover:text-slate-900 font-semibold"
            >
              Timestamp
              {isSorted === "asc" ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : isSorted === "desc" ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronUpDownIcon className="w-4 h-4" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm">
            {format(new Date(row.original.createdAt), "PPp")}
          </div>
        ),
      },
      {
        accessorKey: "user",
        header: () => {
          const searchValue =
            (columnFilters.find((f) => f.id === "search")?.value as string) ||
            "";
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold">User</span>
              <SearchPopover
                value={searchValue}
                onChange={(value) => {
                  setColumnFilters((prev) =>
                    value
                      ? [
                          ...prev.filter((f) => f.id !== "search"),
                          { id: "search", value },
                        ]
                      : prev.filter((f) => f.id !== "search")
                  );
                }}
                placeholder="Search user email..."
              />
            </div>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.user ? (
              <span className="font-medium text-slate-900">
                {row.original.user.email}
              </span>
            ) : (
              <span className="text-slate-400 italic">System</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: () => {
          const filterValue =
            (columnFilters.find((f) => f.id === "action")?.value as string) ||
            "";
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Action</span>
              <FilterPopover
                value={filterValue}
                onChange={(value) => {
                  setColumnFilters((prev) =>
                    value
                      ? [
                          ...prev.filter((f) => f.id !== "action"),
                          { id: "action", value },
                        ]
                      : prev.filter((f) => f.id !== "action")
                  );
                }}
                options={[
                  { value: "", label: "All Actions" },
                  { value: "update_setting", label: "Update Setting" },
                  { value: "enable_2fa", label: "Enable 2FA" },
                  { value: "disable_2fa", label: "Disable 2FA" },
                  { value: "user_login", label: "User Login" },
                  { value: "user_logout", label: "User Logout" },
                ]}
              />
            </div>
          );
        },
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {row.original.action}
          </span>
        ),
      },
      {
        accessorKey: "resource",
        header: () => {
          const filterValue =
            (columnFilters.find((f) => f.id === "resource")?.value as string) ||
            "";
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Resource</span>
              <FilterPopover
                value={filterValue}
                onChange={(value) => {
                  setColumnFilters((prev) =>
                    value
                      ? [
                          ...prev.filter((f) => f.id !== "resource"),
                          { id: "resource", value },
                        ]
                      : prev.filter((f) => f.id !== "resource")
                  );
                }}
                options={[
                  { value: "", label: "All Resources" },
                  { value: "app_settings", label: "App Settings" },
                  { value: "users", label: "Users" },
                  { value: "sessions", label: "Sessions" },
                ]}
              />
            </div>
          );
        },
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-700">
            {row.original.resource}
          </span>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: () => <span className="font-semibold">IP Address</span>,
        cell: ({ row }) => (
          <span className="text-sm font-mono text-slate-600">
            {row.original.ipAddress || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "changes",
        header: () => <span className="font-semibold">Changes</span>,
        cell: ({ row }) => {
          if (!row.original.changes)
            return <span className="text-slate-400">-</span>;
          return (
            <details className="text-xs">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                View Details
              </summary>
              <pre className="mt-2 bg-slate-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(row.original.changes, null, 2)}
              </pre>
            </details>
          );
        },
      },
    ],
    [columnFilters]
  );

  // Initialize table
  const table = useReactTable({
    data: logs,
    columns,
    pageCount,
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
          <h2 className="text-2xl font-bold text-slate-900">Audit Logs</h2>

          <p className="text-slate-600 mt-1">
            Track all system changes and user actions
          </p>
        </div>

        {/* Table Card */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs text-slate-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoading || isFetching ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap"
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
          {!isLoading && logs.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Showing{" "}
                <span className="font-medium">
                  {pagination.pageIndex * pagination.pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    totalCount
                  )}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-700">
                  Page {pagination.pageIndex + 1} of {pageCount}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => table.setPageIndex(pageCount - 1)}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
