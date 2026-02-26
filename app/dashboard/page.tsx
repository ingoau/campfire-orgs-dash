import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardFilteredTable } from "@/components/dashboard-filtered-table";
import { type ParticipantRow } from "@/components/participants-table";
import { ModeToggle } from "@/components/mode-toggle";
import { RawDataToggle } from "@/components/raw-data-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  fetchParticipantsResponse,
  type Event,
  type ParticipantsResponse,
} from "@/lib/cockpit";
import { buildParticipantSummaries, getActiveParticipants } from "@/lib/participants";

const EMPTY_EVENT: Event = {
  id: "",
  name: "",
  displayName: "",
  format: "",
  city: "",
  country: "",
  status: "",
  numParticipants: 0,
  estimatedAttendeesCount: 0,
  percentSignup: 0,
  hasVenue: false,
  pocName: [],
  pocEmail: [],
  rmName: [],
  rmEmail: [],
  venue: {
    id: "",
    venueName: "",
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressState: "",
    addressCountry: "",
    addressZip: "",
  },
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  },
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  let apiResponse: ParticipantsResponse = {
    event: EMPTY_EVENT,
    participants: [],
    raw: [],
  };
  let participantsError: string | null = null;

  try {
    apiResponse = await fetchParticipantsResponse();
  } catch (error: unknown) {
    participantsError =
      error instanceof Error
        ? error.message
        : "Failed to load participants from Cockpit.";
  }

  const allParticipants = apiResponse.participants;
  const event = apiResponse.event;
  const participants = getActiveParticipants(allParticipants);
  const summaries = buildParticipantSummaries(allParticipants);

  const rows: ParticipantRow[] = participants.map((participant) => ({
    displayName: participant.displayName,
    email: participant.email,
    pronouns: participant.pronouns,
    age: participant.age,
    checkinCompleted: participant.checkinCompleted,
    shirtSize: participant.shirtSize,
    dietaryRestrictions: participant.dietaryRestrictions,
    additionalAccommodations: participant.additionalAccommodations,
    emergencyContact1Name: participant.emergencyContact1Name,
    emergencyContact1Phone: participant.emergencyContact1Phone,
    emergencyContact1Relationship: participant.emergencyContact1Relationship,
  }));

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Participants Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Signed in as {session.user.email ?? session.user.name ?? "user"}
          </p>
          {event.displayName || event.name ? (
            <p className="text-sm text-zinc-500">
              Event: {event.displayName || event.name} ({event.city}, {event.country})
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Refresh</Link>
          </Button>
          <SignOutButton />
        </div>
      </header>

      {participantsError ? (
        <section className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {participantsError}
        </section>
      ) : null}

      <DashboardFilteredTable
        summaries={summaries}
        estimatedAttendeesCount={event.estimatedAttendeesCount}
        rows={rows}
      />
      <RawDataToggle data={apiResponse.raw} />
    </main>
  );
}
