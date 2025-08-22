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

import type { KKMTableData } from "@/interface/kkm";
import { deleteKKM } from "../actions/kkmActions";
import KKMModal from "./modalKkm";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: "text" | "number" | "truncate";
}

interface DataTableProps {
  data: KKMTableData[];
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

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchValue) return data;

    return data.filter((item) => {
      const searchKeys = searchKey.split(".");
      let value: any = item;

      for (const key of searchKeys) {
        value = value?.[key];
      }

      return String(value || "")
        .toLowerCase()
        .includes(searchValue.toLowerCase());
    });
  }, [data, searchValue, searchKey]);

  // Get nested value from object using dot notation
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // Handle delete action
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus KKM ini?")) {
      return;
    }

    setIsDeleting(id);
    try {
      const result = await deleteKKM(id);
      if (result.success) {
        toast.success(result.message);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Gagal menghapus KKM");
      }
    } catch (error) {
      console.error("Error deleting KKM:", error);
      toast.error("Terjadi kesalahan saat menghapus KKM");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
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
              {showActions && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {searchValue
                    ? "Tidak ada data yang ditemukan."
                    : "Belum ada data KKM."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => {
                    const value = getNestedValue(item, column.key);
                    return (
                      <TableCell key={column.key}>
                        {column.type === "number" ? (
                          <span className="font-mono font-medium">{value}</span>
                        ) : column.type === "truncate" ? (
                          <div
                            className="max-w-[200px] truncate"
                            title={String(value || "")}
                          >
                            {value || "-"}
                          </div>
                        ) : (
                          value || "-"
                        )}
                      </TableCell>
                    );
                  })}
                  {showActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={isDeleting === item.id}
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <div className="w-full">
                              <KKMModal kkmData={item} isEdit={true} />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 focus:text-red-600"
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

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Menampilkan {filteredData.length} dari {data.length} data KKM
        {searchValue && ` dengan pencarian "${searchValue}"`}
      </div>
    </div>
  );
}
