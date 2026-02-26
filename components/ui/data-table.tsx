"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from "lucide-react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  filterPlaceholder?: string
  emptyMessage?: string
  initialSort?: SortingState
}

type DataTableColumnMeta = {
  cellClassName?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  filterPlaceholder = "Search...",
  emptyMessage = "No results.",
  initialSort = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSort)
  const [globalFilter, setGlobalFilter] = React.useState("")

  // TanStack Table manages internal mutable state; this hook is intentionally used directly.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rowCount = table.getRowModel().rows.length

  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold tabular-nums">{rowCount}</span> result
            {rowCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex w-full max-w-md items-center gap-2">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder={filterPlaceholder}
              className="pl-9"
            />
          </div>
          {globalFilter ? (
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => setGlobalFilter("")}
              aria-label="Clear search"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <Table className="min-w-[900px]">
        <TableHeader className="sticky top-0 z-10 bg-card">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortDirection = header.column.getIsSorted()

                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sortDirection === "asc" ? (
                          <ArrowUp className="size-4" />
                        ) : sortDirection === "desc" ? (
                          <ArrowDown className="size-4" />
                        ) : (
                          <ArrowUpDown className="size-4" />
                        )}
                      </Button>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="odd:bg-muted/20"
              >
                {row.getVisibleCells().map((cell) => {
                  const columnMeta = cell.column.columnDef.meta as DataTableColumnMeta | undefined

                  return (
                    <TableCell
                      key={cell.id}
                      className={`max-w-xs align-top whitespace-normal wrap-break-word ${columnMeta?.cellClassName ?? ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  )
}
