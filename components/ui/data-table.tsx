"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
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

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        {title ? <h2 className="text-lg font-semibold">{title}</h2> : <div />}
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder={filterPlaceholder}
          className="w-full max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
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
                className=""
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="max-w-xs align-top whitespace-normal wrap-break-word"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="">
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
