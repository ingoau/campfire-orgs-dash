"use client";

import { useMemo } from "react";
import { type ColumnDef, type SortingState } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

export interface ParticipantRow {
  displayName: string;
  email: string;
  pronouns: string;
  age: number;
  checkinCompleted: boolean;
  shirtSize: string;
  dietaryRestrictions: string;
  additionalAccommodations: string;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact1Relationship: string;
}

function formatFlag(value: boolean): string {
  return value ? "Yes" : "No";
}

function displayOrDash(value: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : "-";
}

export function ParticipantsTable({ data }: { data: ParticipantRow[] }) {
  const columns = useMemo<ColumnDef<ParticipantRow>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Display Name",
        cell: ({ row }) => displayOrDash(row.original.displayName),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => displayOrDash(row.original.email),
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) => String(row.original.age),
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
        id: "emergencyContact1",
        header: "Emergency Contact 1",
        accessorFn: (row) =>
          [row.emergencyContact1Name, row.emergencyContact1Relationship]
            .filter((value) => value.trim().length > 0)
            .join(" - "),
        cell: ({ row }) =>
          [
            displayOrDash(row.original.emergencyContact1Name),
            displayOrDash(row.original.emergencyContact1Phone),
            displayOrDash(row.original.emergencyContact1Relationship),
          ].join(" / "),
      },
    ],
    [],
  );
  const initialSort: SortingState = [{ id: "displayName", desc: false }];

  return (
    <DataTable
      columns={columns}
      data={data}
      title="Participants"
      filterPlaceholder="Search participants..."
      emptyMessage="No participants match the current filters."
      initialSort={initialSort}
    />
  );
}
