"use client";

import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";

import { ParticipantsTable, type ParticipantRow } from "@/components/participants-table";
import { Button } from "@/components/ui/button";
import { type KeyedCount, type ParticipantSummaries } from "@/lib/participants";

type DashboardFilter =
  | { kind: "checked-in" }
  | { kind: "not-checked-in" }
  | { kind: "dietary"; value: string }
  | { kind: "pronouns"; value: string }
  | { kind: "accommodation"; value: string };

function normalizeFilterValue(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function tokenizeRestrictions(restrictions: string): string[] {
  return restrictions
    .split(/[,/;]/g)
    .map((value) => value.trim())
    .filter(Boolean);
}

function rowMatchesFilter(row: ParticipantRow, filter: DashboardFilter | null): boolean {
  if (!filter) {
    return true;
  }

  if (filter.kind === "checked-in") {
    return row.checkinCompleted;
  }

  if (filter.kind === "not-checked-in") {
    return !row.checkinCompleted;
  }

  if (filter.kind === "dietary") {
    const normalizedTarget = normalizeFilterValue(filter.value);
    return tokenizeRestrictions(row.dietaryRestrictions).some(
      (restriction) => normalizeFilterValue(restriction) === normalizedTarget,
    );
  }

  if (filter.kind === "pronouns") {
    return normalizeFilterValue(row.pronouns) === normalizeFilterValue(filter.value);
  }

  return (
    normalizeFilterValue(row.additionalAccommodations) ===
    normalizeFilterValue(filter.value)
  );
}

function getFilterLabel(filter: DashboardFilter): string {
  if (filter.kind === "checked-in") {
    return "Checked in";
  }

  if (filter.kind === "not-checked-in") {
    return "Not checked in";
  }

  if (filter.kind === "dietary") {
    return `Dietary: ${filter.value}`;
  }

  if (filter.kind === "pronouns") {
    return `Pronouns: ${filter.value}`;
  }

  return `Accommodation: ${filter.value}`;
}

function SummaryCard({
  label,
  value,
  onClick,
  isActive = false,
}: {
  label: string;
  value: number;
  onClick?: () => void;
  isActive?: boolean;
}) {
  if (!onClick) {
    return (
      <article className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      </article>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      aria-pressed={isActive}
      className={`h-auto w-full flex-col items-start justify-start rounded-xl px-4 py-4 text-left shadow-xs transition-colors ${isActive
        ? "border-primary/50 bg-primary/10 hover:bg-primary/10 dark:border-primary/60 dark:bg-primary/15 dark:hover:bg-primary/15"
        : "hover:border-muted-foreground/40"
        }`}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </Button>
  );
}

function CountList({
  title,
  values,
  emptyLabel,
  filterKind,
  activeFilter,
  setActiveFilter,
}: {
  title: string;
  values: KeyedCount[];
  emptyLabel: string;
  filterKind: "dietary" | "pronouns" | "accommodation";
  activeFilter: DashboardFilter | null;
  setActiveFilter: (filter: DashboardFilter | null) => void;
}) {
  const sortedValues = useMemo(
    () => [...values].sort((first, second) => second.count - first.count),
    [values],
  );

  return (
    <section className="rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-base font-semibold">{title}</h2>
      {sortedValues.length > 0 ? (
        <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1 text-sm">
          {sortedValues.map((item) => {
            const isActive =
              activeFilter?.kind === filterKind &&
              "value" in activeFilter &&
              normalizeFilterValue(activeFilter.value) ===
              normalizeFilterValue(item.label);

            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      isActive ? null : { kind: filterKind, value: item.label },
                    )
                  }
                  className={`flex w-full justify-between gap-3 rounded-md px-2 py-1 text-left transition-colors ${isActive
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-muted/60"
                    }`}
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold tabular-nums">{item.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">{emptyLabel}</p>
      )}
    </section>
  );
}

export function DashboardFilteredTable({
  summaries,
  rows,
}: {
  summaries: ParticipantSummaries;
  rows: ParticipantRow[];
}) {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter | null>(null);
  const totalNotCheckedIn = Math.max(0, summaries.totalAll - summaries.totalCheckedIn);

  const filteredRows = useMemo(
    () => rows.filter((row) => rowMatchesFilter(row, activeFilter)),
    [activeFilter, rows],
  );

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total participants"
          value={summaries.totalAll}
          onClick={() => setActiveFilter(null)}
        />
        <SummaryCard
          label="Checked in"
          value={summaries.totalCheckedIn}
          onClick={() =>
            setActiveFilter((current) =>
              current?.kind === "checked-in" ? null : { kind: "checked-in" },
            )
          }
          isActive={activeFilter?.kind === "checked-in"}
        />
        <SummaryCard
          label="Not Checked In"
          value={totalNotCheckedIn}
          onClick={() =>
            setActiveFilter((current) =>
              current?.kind === "not-checked-in" ? null : { kind: "not-checked-in" },
            )
          }
          isActive={activeFilter?.kind === "not-checked-in"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CountList
          title="Dietary Restrictions"
          values={summaries.dietaryRestrictions}
          emptyLabel="No dietary restrictions provided."
          filterKind="dietary"
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <CountList
          title="Additional Accommodations"
          values={summaries.accommodations}
          emptyLabel="No accommodations provided."
          filterKind="accommodation"
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-xs">
        {activeFilter ? (
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-foreground">
              <Filter className="size-3" />
              {getFilterLabel(activeFilter)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-7"
              onClick={() => setActiveFilter(null)}
            >
              <X className="size-3.5" />
              Clear
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground">
            Select a summary card or category value to focus the table.
          </span>
        )}
        <span className="font-medium tabular-nums text-muted-foreground">
          Showing {filteredRows.length} of {rows.length}
        </span>
      </section>

      <ParticipantsTable data={filteredRows} />
    </div>
  );
}
