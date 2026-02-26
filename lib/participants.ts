import { type Participant } from "@/lib/cockpit";

export interface KeyedCount {
  label: string;
  count: number;
}

export interface ParticipantSummaries {
  totalAll: number;
  totalActive: number;
  totalCheckedIn: number;
  totalVolunteers: number;
  totalDisabled: number;
  dietaryRestrictions: KeyedCount[];
  shirtSizes: KeyedCount[];
  pronouns: KeyedCount[];
  accommodations: KeyedCount[];
}

export function getActiveParticipants(
  participants: Participant[],
): Participant[] {
  return participants.filter((participant) => !participant.disabled);
}

function normalizeValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.trim();
}

function getSortedCounts(map: Map<string, number>): KeyedCount[] {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.label.localeCompare(b.label);
    });
}

function countByValues(values: string[]): KeyedCount[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    const current = counts.get(value) ?? 0;
    counts.set(value, current + 1);
  }

  return getSortedCounts(counts);
}

function tokenizeRestrictions(restrictions: string): string[] {
  const normalized = normalizeValue(restrictions);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/[,/;]/g)
    .map((value) => normalizeValue(value))
    .filter(Boolean);
}

export function buildParticipantSummaries(
  allParticipants: Participant[],
): ParticipantSummaries {
  const activeParticipants = getActiveParticipants(allParticipants);

  const dietaryCounts = countByValues(
    activeParticipants.flatMap((participant) =>
      tokenizeRestrictions(participant.dietaryRestrictions),
    ),
  );
  const shirtSizeCounts = countByValues(
    activeParticipants
      .map((participant) => normalizeValue(participant.shirtSize))
      .filter(Boolean),
  );
  const pronounCounts = countByValues(
    activeParticipants
      .map((participant) => normalizeValue(participant.pronouns))
      .filter(Boolean),
  );
  const accommodationCounts = countByValues(
    activeParticipants
      .map((participant) => normalizeValue(participant.additionalAccommodations))
      .filter(Boolean),
  );

  return {
    totalAll: allParticipants.length,
    totalActive: activeParticipants.length,
    totalCheckedIn: activeParticipants.filter(
      (participant) => participant.checkinCompleted,
    ).length,
    totalVolunteers: activeParticipants.filter(
      (participant) => participant.isVolunteer,
    ).length,
    totalDisabled: allParticipants.filter((participant) => participant.disabled)
      .length,
    dietaryRestrictions: dietaryCounts,
    shirtSizes: shirtSizeCounts,
    pronouns: pronounCounts,
    accommodations: accommodationCounts,
  };
}
