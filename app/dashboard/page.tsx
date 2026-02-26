import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, CalendarDays, Mail, RefreshCw } from "lucide-react";

import { DashboardFilteredTable } from "@/components/dashboard-filtered-table";
import { type ParticipantRow } from "@/components/participants-table";
import { ModeToggle } from "@/components/mode-toggle";
import { RawDataToggle } from "@/components/raw-data-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { isEmailAllowlisted } from "@/lib/email-allowlist";
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
  const isDevelopment = process.env.NODE_ENV === "development";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (!isEmailAllowlisted(session.user.email)) {
    redirect("/sign-in?error=not-allowed");
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
    console.error("Failed to load participants from Cockpit.", error);
    participantsError = "Failed to load participants. Please try again later.";
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

  const eventName = event.displayName || event.name;

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="supports-backdrop-filter:bg-card/60 rounded-xl border bg-card/70 p-5 shadow-xs backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Participants Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {session.user.email ?? session.user.name ?? "user"}
              </span>
              {eventName ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {eventName}
                  {event.city && event.country ? ` (${event.city}, ${event.country})` : ""}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5">
                <RefreshCw className="size-3.5" />
                Refresh
              </Link>
            </Button>
            <SignOutButton />
          </div>
        </div>
      </header>

      {participantsError ? (
        <section className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{participantsError}</span>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <DashboardFilteredTable
          summaries={summaries}
          estimatedAttendeesCount={event.estimatedAttendeesCount}
          rows={rows}
        />
      </section>

      {isDevelopment ? <RawDataToggle data={apiResponse.raw} /> : null}
    </main>
  );
}
