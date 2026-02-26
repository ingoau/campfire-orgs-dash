import "server-only";

const DEFAULT_BASE_URL = "https://cockpit.hackclub.com";

export interface Participant {
  id: string;
  displayName: string;
  legalFirstName: string;
  legalLastName: string;
  email: string;
  phone: string;
  pronouns: Pronouns | "";
  age: number | null;
  referralContext: string;
  createdTime: Date | null;
  disabled: boolean;
  pendingDisable: boolean;
  isVolunteer: boolean;
  pendingVolunteer: boolean;
  checkinCompleted: boolean;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact1Relationship: string;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  emergencyContact2Relationship: string;
  shirtSize: ShirtSize | "";
  dietaryRestrictions: string;
  additionalAccommodations: AdditionalAccommodations | "";
}

export enum AdditionalAccommodations {
  ClearInstructions = "Clear instructions",
  None = "none",
}

export enum Pronouns {
  HeHim = "he/him",
  SheHer = "she/her",
  TheyThemOrOther = "they/them or other",
}

export enum ShirtSize {
  L = "L",
  M = "M",
  S = "S",
  Xl = "XL",
}

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asNullableNumber(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return value;
}

function asNullableDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function normalizeParticipant(row: unknown): Participant | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const participant = row as UnknownRecord;

  return {
    id: asString(participant.id),
    displayName: asString(participant.displayName),
    legalFirstName: asString(participant.legalFirstName),
    legalLastName: asString(participant.legalLastName),
    email: asString(participant.email),
    phone: asString(participant.phone),
    pronouns: asString(participant.pronouns) as Pronouns | "",
    age: asNullableNumber(participant.age),
    referralContext: asString(participant.referralContext),
    createdTime: asNullableDate(participant.createdTime),
    disabled: asBoolean(participant.disabled),
    pendingDisable: asBoolean(participant.pendingDisable),
    isVolunteer: asBoolean(participant.isVolunteer),
    pendingVolunteer: asBoolean(participant.pendingVolunteer),
    checkinCompleted: asBoolean(participant.checkinCompleted),
    emergencyContact1Name: asString(participant.emergencyContact1Name),
    emergencyContact1Phone: asString(participant.emergencyContact1Phone),
    emergencyContact1Relationship: asString(
      participant.emergencyContact1Relationship,
    ),
    emergencyContact2Name: asString(participant.emergencyContact2Name),
    emergencyContact2Phone: asString(participant.emergencyContact2Phone),
    emergencyContact2Relationship: asString(
      participant.emergencyContact2Relationship,
    ),
    shirtSize: asString(participant.shirtSize) as ShirtSize | "",
    dietaryRestrictions: asString(participant.dietaryRestrictions),
    additionalAccommodations: asString(
      participant.additionalAccommodations,
    ) as AdditionalAccommodations | "",
  };
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

function extractParticipants(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "participants" in payload &&
    Array.isArray((payload as { participants: unknown[] }).participants)
  ) {
    return (payload as { participants: unknown[] }).participants;
  }

  return [];
}

export async function fetchParticipants(): Promise<Participant[]> {
  const baseURL = process.env.COCKPIT_BASE_URL ?? DEFAULT_BASE_URL;
  const eventId = getEnv("COCKPIT_EVENT_ID");
  const apiKey = getEnv("COCKPIT_API_KEY");

  const response = await fetch(`${baseURL}/api/v1/events/${eventId}/participants`, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch participants: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const rows = extractParticipants(payload);

  return rows
    .map(normalizeParticipant)
    .filter((participant): participant is Participant => participant !== null);
}
