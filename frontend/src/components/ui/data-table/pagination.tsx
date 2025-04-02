import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface DataTablePaginationProps<TData> {
  table: any;
  pageSizeOptions?: number[];
  onRefreshToken?: () => void;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onRefreshToken
}: DataTablePaginationProps<TData>) {
  // Memantau error untuk token expired
  useEffect(() => {
    // Jika tabel dalam state error dan itu adalah error 401
    if (table.getState().error && 
        typeof table.getState().error === 'object' && 
        table.getState().error.status === 401) {
      
      // Log error untuk debug
      console.log("[DataTable] Error 401 detected:", table.getState().error);
      
      // Jika ada callback refresh token, panggil
      if (onRefreshToken) {
        console.log("[DataTable] Triggering token refresh callback");
        onRefreshToken();
      } else {
        // Jika tidak ada callback, coba refresh halaman sebagai fallback
        console.log("[DataTable] No refresh callback, reloading page");
        window.location.reload();
      }
    }
  }, [table.getState().error, onRefreshToken]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-start text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="hidden sm:flex h-8 w-8 p-0 lg:flex items-center justify-center"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to first page</span>
          <span>«</span>
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to previous page</span>
          <span>‹</span>
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to next page</span>
          <span>›</span>
        </Button>
        <Button
          variant="outline"
          className="hidden sm:flex h-8 w-8 p-0 lg:flex items-center justify-center"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to last page</span>
          <span>»</span>
        </Button>
      </div>
    </div>
  );
} 