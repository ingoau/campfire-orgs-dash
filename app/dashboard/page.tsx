import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ParticipantsTable,
  type ParticipantRow,
} from "@/components/participants-table";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { fetchParticipants, type Participant } from "@/lib/cockpit";
import {
  buildParticipantSummaries,
  getActiveParticipants,
  type KeyedCount,
} from "@/lib/participants";

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function CountList({
  title,
  values,
  emptyLabel,
}: {
  title: string;
  values: KeyedCount[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-base font-semibold">{title}</h2>
      {values.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {values.map((item) => (
            <li key={item.label} className="flex justify-between gap-3">
              <span className="text-zinc-600 dark:text-zinc-300">{item.label}</span>
              <span className="font-medium">{item.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">{emptyLabel}</p>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  let allParticipants: Participant[] = [];
  let participantsError: string | null = null;

  try {
    allParticipants = await fetchParticipants();
  } catch (error: unknown) {
    participantsError =
      error instanceof Error
        ? error.message
        : "Failed to load participants from Cockpit.";
  }

  const participants = getActiveParticipants(allParticipants);
  const summaries = buildParticipantSummaries(allParticipants);

  const rows: ParticipantRow[] = participants.map((participant) => ({
    id: participant.id,
    displayName: participant.displayName,
    legalFirstName: participant.legalFirstName,
    legalLastName: participant.legalLastName,
    email: participant.email,
    phone: participant.phone,
    pronouns: participant.pronouns,
    age: participant.age,
    checkinCompleted: participant.checkinCompleted,
    isVolunteer: participant.isVolunteer,
    shirtSize: participant.shirtSize,
    dietaryRestrictions: participant.dietaryRestrictions,
    additionalAccommodations: participant.additionalAccommodations,
    createdTimeIso: participant.createdTime?.toISOString() ?? null,
  }));

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Participants Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Signed in as {session.user.email ?? session.user.name ?? "user"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
          >
            Refresh
          </Link>
          <SignOutButton />
        </div>
      </header>

      {participantsError ? (
        <section className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {participantsError}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Total participants (active)" value={summaries.totalActive} />
        <SummaryCard label="Checked in" value={summaries.totalCheckedIn} />
        <SummaryCard label="Volunteers" value={summaries.totalVolunteers} />
        <SummaryCard label="Disabled hidden" value={summaries.totalDisabled} />
        <SummaryCard label="Total returned" value={summaries.totalAll} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <CountList
          title="Dietary Restrictions"
          values={summaries.dietaryRestrictions}
          emptyLabel="No dietary restrictions provided."
        />
        <CountList
          title="Shirt Sizes"
          values={summaries.shirtSizes}
          emptyLabel="No shirt sizes provided."
        />
        <CountList
          title="Pronouns"
          values={summaries.pronouns}
          emptyLabel="No pronouns provided."
        />
        <CountList
          title="Additional Accommodations"
          values={summaries.accommodations}
          emptyLabel="No accommodations provided."
        />
      </section>

      <ParticipantsTable data={rows} />
    </main>
  );
}
