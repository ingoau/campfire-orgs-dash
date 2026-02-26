"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

export interface ParticipantRow {
  id: string;
  displayName: string;
  legalFirstName: string;
  legalLastName: string;
  email: string;
  phone: string;
  pronouns: string;
  age: number | null;
  checkinCompleted: boolean;
  isVolunteer: boolean;
  shirtSize: string;
  dietaryRestrictions: string;
  additionalAccommodations: string;
  createdTimeIso: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) {
    return "-";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) {
    return "-";
  }

  return date.toLocaleString();
}

function formatFlag(value: boolean): string {
  return value ? "Yes" : "No";
}

function displayOrDash(value: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : "-";
}

export function ParticipantsTable({ data }: { data: ParticipantRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdTimeIso", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<ParticipantRow>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Display Name",
        cell: ({ row }) => displayOrDash(row.original.displayName),
      },
      {
        id: "legalName",
        header: "Legal Name",
        accessorFn: (row) =>
          `${row.legalFirstName} ${row.legalLastName}`.trim() || "-",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => displayOrDash(row.original.email),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => displayOrDash(row.original.phone),
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) =>
          row.original.age === null ? "-" : String(row.original.age),
      },
      {
        accessorKey: "pronouns",
        header: "Pronouns",
        cell: ({ row }) => displayOrDash(row.original.pronouns),
      },
      {
        accessorKey: "checkinCompleted",
        header: "Checked In",
        cell: ({ row }) => formatFlag(row.original.checkinCompleted),
      },
      {
        accessorKey: "isVolunteer",
        header: "Volunteer",
        cell: ({ row }) => formatFlag(row.original.isVolunteer),
      },
      {
        accessorKey: "shirtSize",
        header: "Shirt Size",
        cell: ({ row }) => displayOrDash(row.original.shirtSize),
      },
      {
        accessorKey: "dietaryRestrictions",
        header: "Dietary",
        cell: ({ row }) => displayOrDash(row.original.dietaryRestrictions),
      },
      {
        accessorKey: "additionalAccommodations",
        header: "Accommodations",
        cell: ({ row }) => displayOrDash(row.original.additionalAccommodations),
      },
      {
        accessorKey: "createdTimeIso",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdTimeIso),
      },
    ],
    [],
  );

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
  });

  return (
    <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Participants</h2>
        <input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Search participants..."
          className="w-full max-w-sm rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-zinc-200 dark:border-zinc-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-2 py-2 font-semibold">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-100 dark:border-zinc-900"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-2 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            No participants match the current filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
