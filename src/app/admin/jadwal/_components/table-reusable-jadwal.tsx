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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import type { Jadwal } from "@/interface/jadwal";
import { deleteJadwal } from "../actions/jadwalActions";
import JadwalModal from "./modalJadwal";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: "text" | "truncate" | "day" | "time";
}

interface DataTableProps {
  data: Jadwal[];
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(
    new Set()
  );
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);
  const selectAllRef = React.useRef<HTMLButtonElement>(null);

  // Helper function to get nested values
  const getNestedValue = (obj: Jadwal, path: string): unknown => {
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

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const renderCellValue = (item: Jadwal, column: TableColumn) => {
    let value: unknown;

    // Handle nested properties for related objects
    if (column.key.includes(".")) {
      value = getNestedValue(item, column.key);
    } else {
      // Handle direct properties and known nested objects
      switch (column.key) {
        case "kelas":
          value = item.kelas?.namaKelas || "-";
          break;
        case "guru":
          // Check if it's a break time or system teacher
          if (
            item.mataPelajaran?.nama?.toLowerCase().includes("istirahat") ||
            item.guru?.namaLengkap?.toLowerCase().includes("sistem istirahat")
          ) {
            value = "Tidak ada guru";
          } else {
            value = item.guru?.namaLengkap || "-";
          }
          break;
        case "mataPelajaran":
          value = item.mataPelajaran?.nama || "-";
          break;
        default:
          value = (item as unknown as Record<string, unknown>)[column.key];
      }
    }

    switch (column.type) {
      case "day":
        return value
          ? String(value)
              .toLowerCase()
              .replace(/^\w/, (c) => c.toUpperCase())
          : "-";
      case "time":
        return value ? String(value) : "-";
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

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map((item) => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedItems.has(item.id));
  const isSomeSelected = paginatedData.some((item) =>
    selectedItems.has(item.id)
  );

  // Update indeterminate state for select all checkbox
  React.useEffect(() => {
    if (selectAllRef.current) {
      const checkbox = selectAllRef.current.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      if (checkbox) {
        checkbox.indeterminate = isSomeSelected && !isAllSelected;
      }
    }
  }, [isSomeSelected, isAllSelected]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      return;
    }

    setIsDeleting(id);
    try {
      const result = await deleteJadwal(id);
      if (result.success) {
        toast.success(result.message);
        // Remove from selection if it was selected
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        toast.error(result.error || "Gagal menghapus jadwal");
      }
    } catch (error) {
      console.error("Error deleting jadwal:", error);
      toast.error("Terjadi kesalahan saat menghapus jadwal");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Pilih setidaknya satu jadwal untuk dihapus");
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus ${selectedItems.size} jadwal yang dipilih?`
      )
    ) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedItems).map((id) =>
        deleteJadwal(id)
      );
      const results = await Promise.all(deletePromises);

      const successCount = results.filter((result) => result.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Berhasil menghapus ${successCount} jadwal`);
      }
      if (failCount > 0) {
        toast.error(`Gagal menghapus ${failCount} jadwal`);
      }

      // Clear selection
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Error bulk deleting jadwal:", error);
      toast.error("Terjadi kesalahan saat menghapus jadwal");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8"
          />
        </div>

        {selectedItems.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedItems.size} item dipilih
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="h-8"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isBulkDeleting ? "Menghapus..." : "Hapus Terpilih"}
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  ref={selectAllRef}
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Pilih semua"
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {showActions && <TableHead className="w-[100px]">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions ? 2 : 1)}
                  className="h-24 text-center"
                >
                  {filteredData.length === 0
                    ? "Tidak ada data jadwal."
                    : "Tidak ada data pada halaman ini."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  className={selectedItems.has(item.id) ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(item.id, checked as boolean)
                      }
                      aria-label={`Pilih jadwal ${item.id}`}
                    />
                  </TableCell>
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
                            <JadwalModal jadwalData={item} isEdit={true} />
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

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari{" "}
            {totalItems} jadwal
          </p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">per halaman</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber =
                Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNumber > totalPages) return null;

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="h-8 w-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
