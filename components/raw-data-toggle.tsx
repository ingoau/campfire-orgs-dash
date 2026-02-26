"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

export function RawDataToggle({ data }: { data: unknown }) {
  const [open, setOpen] = useState(false);
  const prettyData = useMemo(() => JSON.stringify(data, null, 2), [data]);

  return (
    <section className="rounded-xl border border-dashed bg-card/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Developer: Raw API Data</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Hide Raw Data" : "Show Raw Data"}
        </Button>
      </div>
      {open ? (
        <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
          {prettyData}
        </pre>
      ) : null}
    </section>
  );
}
