"use client";

import { useMemo, useState } from "react";

import { ParticipantsTable, type ParticipantRow } from "@/components/participants-table";
import { Button } from "@/components/ui/button";
import { type KeyedCount, type ParticipantSummaries } from "@/lib/participants";

type DashboardFilter =
  | { kind: "checked-in" }
  | { kind: "dietary"; value: string }
  | { kind: "shirt-size"; value: string }
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

  if (filter.kind === "dietary") {
    const normalizedTarget = normalizeFilterValue(filter.value);
    return tokenizeRestrictions(row.dietaryRestrictions).some(
      (restriction) => normalizeFilterValue(restriction) === normalizedTarget,
    );
  }

  if (filter.kind === "shirt-size") {
    return normalizeFilterValue(row.shirtSize) === normalizeFilterValue(filter.value);
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

  if (filter.kind === "dietary") {
    return `Dietary: ${filter.value}`;
  }

  if (filter.kind === "shirt-size") {
    return `Shirt size: ${filter.value}`;
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
      <article className="rounded-lg border p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </article>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={`h-auto w-full flex-col items-start justify-start rounded-lg px-4 py-4 text-left shadow-none transition-colors ${isActive
        ? "border-zinc-800 bg-zinc-100 hover:bg-zinc-100 dark:border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-900"
        : "hover:border-zinc-400 dark:hover:border-zinc-500"
        }`}
    >
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
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
  filterKind: "dietary" | "shirt-size" | "pronouns" | "accommodation";
  activeFilter: DashboardFilter | null;
  setActiveFilter: (filter: DashboardFilter | null) => void;
}) {
  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {values.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {values.map((item) => {
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
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                >
                  <span className="text-zinc-600 dark:text-zinc-300">{item.label}</span>
                  <span className="font-medium">{item.count}</span>
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
  estimatedAttendeesCount,
  percentSignup,
  rows,
}: {
  summaries: ParticipantSummaries;
  estimatedAttendeesCount: number;
  percentSignup: number;
  rows: ParticipantRow[];
}) {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter | null>(null);

  const filteredRows = useMemo(
    () => rows.filter((row) => rowMatchesFilter(row, activeFilter)),
    [activeFilter, rows],
  );

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          label="Estimated attendees"
          value={estimatedAttendeesCount}
        />
        <SummaryCard label="Signup %" value={Math.round(percentSignup)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <CountList
          title="Dietary Restrictions"
          values={summaries.dietaryRestrictions}
          emptyLabel="No dietary restrictions provided."
          filterKind="dietary"
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <CountList
          title="Shirt Sizes"
          values={summaries.shirtSizes}
          emptyLabel="No shirt sizes provided."
          filterKind="shirt-size"
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
        <CountList
          title="Pronouns"
          values={summaries.pronouns}
          emptyLabel="No pronouns provided."
          filterKind="pronouns"
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

      {activeFilter ? (
        <section className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <span>
            Table filter: <strong>{getFilterLabel(activeFilter)}</strong>
          </span>
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 py-0"
            onClick={() => setActiveFilter(null)}
          >
            Clear filter
          </Button>
        </section>
      ) : null}

      <ParticipantsTable data={filteredRows} />
    </>
  );
}
