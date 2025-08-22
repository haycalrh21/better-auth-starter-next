"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { MataPelajaran } from "@/interface/mataPelajaran";
import { deleteMataPelajaran } from "../actions/mataPelajaranActions";
import MataPelajaranModal from "./modalMataPelajaran";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: "text" | "truncate";
}

interface DataTableProps {
  data: MataPelajaran[];
  columns: TableColumn[];
  searchKey: string;
  searchPlaceholder?: string;
  showSelection?: boolean;
  showColumnToggle?: boolean;
  showActions?: boolean;
}

export function DataTable({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Cari...",
  showActions = true,
}: DataTableProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  // Helper function to get nested values
  const getNestedValue = (obj: MataPelajaran, path: string): unknown => {
    return path.split(".").reduce((current: unknown, key: string) => {
      if (current && typeof current === "object" && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj as unknown);
  };

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchValue) return data;

    return data.filter((item) => {
      const searchInValue = String(
        getNestedValue(item, searchKey) || ""
      ).toLowerCase();
      return searchInValue.includes(searchValue.toLowerCase());
    });
  }, [data, searchValue, searchKey]);

  const renderCellValue = (item: MataPelajaran, column: TableColumn) => {
    const value = getNestedValue(item, column.key);

    switch (column.type) {
      case "truncate":
        return value
          ? String(value).length > 50
            ? `${String(value).slice(0, 50)}...`
            : String(value)
          : "-";
      default:
        return value ? String(value) : "-";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini?")) {
      return;
    }

    setIsDeleting(id);
    try {
      const result = await deleteMataPelajaran(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || "Gagal menghapus mata pelajaran");
      }
    } catch (error) {
      console.error("Error deleting mata pelajaran:", error);
      toast.error("Terjadi kesalahan saat menghapus mata pelajaran");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {showActions && <TableHead className="w-[100px]">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  Tidak ada data mata pelajaran.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCellValue(item, column)}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <MataPelajaranModal
                              mataPelajaranData={item}
                              isEdit={true}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting === item.id ? "Menghapus..." : "Hapus"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredData.length} dari {data.length} mata pelajaran
        </div>
      </div>
    </div>
  );
}
