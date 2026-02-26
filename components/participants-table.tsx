"use client";

import { useMemo } from "react";
import { type ColumnDef, type SortingState } from "@tanstack/react-table";
import { Check } from "lucide-react";

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
        meta: {
          cellClassName: "max-w-none whitespace-nowrap wrap-normal",
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            {row.original.checkinCompleted ? (
              <span title="Checked in" className="inline-flex">
                <Check
                  className="size-4 text-emerald-600 dark:text-emerald-400"
                  aria-label="Checked in"
                />
              </span>
            ) : null}
            <span>{displayOrDash(row.original.displayName)}</span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          const email = row.original.email.trim();
          if (!email) {
            return "-";
          }

          return (
            <a
              href={`mailto:${email}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {email}
            </a>
          );
        },
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
        cell: ({ row }) => {
          const name = displayOrDash(row.original.emergencyContact1Name);
          const phone = displayOrDash(row.original.emergencyContact1Phone);
          const relationship = displayOrDash(row.original.emergencyContact1Relationship);

          return (
            <div className="space-y-0.5">
              <p>{name}</p>
              <p className="text-muted-foreground">
                {phone} - {relationship}
              </p>
            </div>
          );
        },
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
