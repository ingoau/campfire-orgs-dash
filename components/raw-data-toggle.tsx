"use client";

import { useMemo, useState } from "react";

export function RawDataToggle({ data }: { data: unknown }) {
  const [open, setOpen] = useState(false);
  const prettyData = useMemo(() => JSON.stringify(data, null, 2), [data]);

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Testing: Raw API Data</h2>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          {open ? "Hide Raw Data" : "Show Raw Data"}
        </button>
      </div>
      {open ? (
        <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
          {prettyData}
        </pre>
      ) : null}
    </section>
  );
}
