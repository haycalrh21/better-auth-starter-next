"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Trash2,
  Pencil,
  User,
  GraduationCap,
  Phone,
  Briefcase,
  BookOpen,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import DeleteGuruDialog from "./delete-guru";
import { ViewGuruDialog } from "./viewDataGuru";
import BulkOperationsModal from "./bulk-operations-modal";
import { GuruWithRelations } from "@/interface";
import { EditGuruDialog } from "./edit-data";

export interface TableColumn<TData> {
  key: keyof TData | string;
  label: string;
  sortable?: boolean;
  type?:
    | "text"
    | "email"
    | "date"
    | "boolean"
    | "number"
    | "truncate"
    | "badge"
    | "employment"
    | "kelas"
    | "phone"
    | "subjects"
    | "nip";
}

interface DataTableProps<TData extends Record<string, unknown>> {
  data: TData[];
  columns: TableColumn<TData>[];
  searchKey?: keyof TData;
  searchPlaceholder?: string;
  showSelection?: boolean;
  showColumnToggle?: boolean;
  showActions?: boolean;
}

function getValueByPath<T extends object>(obj: T, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (Array.isArray(acc)) {
      return (acc[0] as Record<string, unknown>)?.[part];
    }
    if (typeof acc === "object" && acc !== null) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function DataTable<TData extends Record<string, unknown>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Filter...",
  showSelection = true,
  showColumnToggle = true,
  showActions = true,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [bulkModalOpen, setBulkModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<TData | null>(null);

  const handleView = React.useCallback((item: TData) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  }, []);

  const handleEdit = React.useCallback((item: TData) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  }, []);

  const handleDelete = React.useCallback((item: TData) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  }, []);

  const renderCellValue = React.useCallback((value: unknown, type?: string) => {
    if (value === null || value === undefined) return <div>-</div>;

    if (type === "boolean") return <div>{Boolean(value) ? "Ya" : "Tidak"}</div>;
    if (type === "number") return <div>{Number(value).toLocaleString()}</div>;
    if (type === "date")
      return <div>{new Date(String(value)).toLocaleDateString("id-ID")}</div>;
    if (type === "email")
      return <div className="lowercase text-blue-600">{String(value)}</div>;
    if (type === "truncate") {
      return (
        <div className="max-w-xs truncate" title={String(value)}>
          {String(value)}
        </div>
      );
    }
    if (type === "phone") {
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{String(value)}</span>
        </div>
      );
    }
    if (type === "nip") {
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{String(value)}</span>
        </div>
      );
    }
    if (type === "kelas") {
      if (Array.isArray(value) && value.length > 0) {
        const activeClasses = value.filter((k: any) => k.isActive);
        if (activeClasses.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {activeClasses.slice(0, 2).map((kelas: any, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  {kelas.namaKelas}
                </Badge>
              ))}
              {activeClasses.length > 2 && (
                <Badge variant="secondary">+{activeClasses.length - 2}</Badge>
              )}
            </div>
          );
        }
      }
      return <span className="text-muted-foreground">Belum ada kelas</span>;
    }
    if (type === "subjects") {
      if (Array.isArray(value) && value.length > 0) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((subject: any, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="flex items-center gap-1"
              >
                <BookOpen className="h-3 w-3" />
                {subject.nama}
              </Badge>
            ))}
            {value.length > 2 && (
              <Badge variant="secondary">+{value.length - 2}</Badge>
            )}
          </div>
        );
      }
      return (
        <span className="text-muted-foreground">Belum ada mata pelajaran</span>
      );
    }
    if (type === "employment") {
      const employment = String(value);
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "outline";
      let icon = <Briefcase className="h-3 w-3" />;

      if (employment.toLowerCase().includes("pns")) {
        variant = "default";
      } else if (employment.toLowerCase().includes("honorer")) {
        variant = "secondary";
      } else if (employment.toLowerCase().includes("kontrak")) {
        variant = "outline";
      }

      return (
        <Badge variant={variant} className="flex items-center gap-1">
          {icon}
          {employment}
        </Badge>
      );
    }
    if (type === "badge") {
      const val = String(value);
      return <Badge variant="outline">{val}</Badge>;
    }

    return <div>{String(value)}</div>;
  }, []);

  const tableColumns: ColumnDef<TData>[] = React.useMemo(() => {
    const generatedColumns: ColumnDef<TData>[] = [];

    if (showSelection) {
      generatedColumns.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(Boolean(value))
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    columns.forEach((col) => {
      generatedColumns.push({
        id: String(col.key),
        accessorFn: (row) => getValueByPath(row, String(col.key)),
        header:
          col.sortable !== false
            ? ({ column }) => (
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                  className="capitalize -ml-4 h-auto p-4"
                >
                  {col.label} <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )
            : col.label,
        cell: ({ getValue }) => renderCellValue(getValue(), col.type),
        sortingFn: (rowA, rowB, columnId) => {
          const a = (rowA.getValue<string | number | boolean>(columnId) ??
            "") as string;
          const b = (rowB.getValue<string | number | boolean>(columnId) ??
            "") as string;

          if (a === "-") return 1;
          if (b === "-") return -1;

          return String(a).localeCompare(String(b), "id", { numeric: true });
        },
      });
    });

    if (showActions) {
      generatedColumns.push({
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleView(item)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(item)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      });
    }

    return generatedColumns;
  }, [
    columns,
    showSelection,
    showActions,
    renderCellValue,
    handleView,
    handleEdit,
    handleDelete,
  ]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex items-center space-x-2">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={
                (table
                  .getColumn(String(searchKey))
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn(String(searchKey))
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
          {showSelection &&
            table.getFilteredSelectedRowModel().rows.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setBulkModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Operasi Bulk ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            )}
        </div>
        <div className="ml-auto flex items-center space-x-2">
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnConfig = columns.find(
                      (col) => String(col.key) === column.id
                    );
                    const label = columnConfig?.label || column.id;
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(Boolean(value))
                        }
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w>[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <ViewGuruDialog
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        item={selectedItem as unknown as GuruWithRelations}
      />

      <EditGuruDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        item={selectedItem as unknown as GuruWithRelations}
      />

      <DeleteGuruDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        item={selectedItem as unknown as GuruWithRelations}
      />

      <BulkOperationsModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        selectedTeachers={table
          .getFilteredSelectedRowModel()
          .rows.map((row) => row.original as unknown as GuruWithRelations)}
        onSuccess={() => {
          setRowSelection({});
          setBulkModalOpen(false);
        }}
      />
    </div>
  );
}
