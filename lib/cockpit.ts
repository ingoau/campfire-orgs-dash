import "server-only";

const DEFAULT_BASE_URL = "https://cockpit.hackclub.com";

export interface ParticipantsAPIResponse {
  event: Event;
  participants: Participant[];
}

export interface Event {
  id: string;
  name: string;
  displayName: string;
  format: string;
  city: string;
  country: string;
  status: string;
  numParticipants: number;
  estimatedAttendeesCount: number;
  percentSignup: number;
  hasVenue: boolean;
  pocName: string[];
  pocEmail: string[];
  rmName: string[];
  rmEmail: string[];
  venue: Venue;
  address: Address;
}

export interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface Venue {
  id: string;
  venueName: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressCountry: string;
  addressZip: string;
}

export interface Participant {
  displayName: string;
  email: string;
  pronouns: Pronouns;
  age: number;
  checkinCompleted: boolean;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact1Relationship: string;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  emergencyContact2Relationship: string;
  shirtSize: ShirtSize;
  dietaryRestrictions: string;
  additionalAccommodations: AdditionalAccommodations;
}

export enum AdditionalAccommodations {
  ClearInstructions = "Clear instructions",
  Empty = "",
  None = "none",
}

export enum Pronouns {
  HeHim = "he/him",
  SheHer = "she/her",
  TheyThemOrOther = "they/them or other",
}

export enum ShirtSize {
  Empty = "",
  L = "L",
  M = "M",
  S = "S",
  Xl = "XL",
}

export interface ParticipantsResponse {
  event: Event;
  participants: Participant[];
  raw: unknown;
}

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asNumber(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return value;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => asString(item));
}

function normalizeAddress(row: unknown): Address {
  if (!row || typeof row !== "object") {
    return { line1: "", line2: "", city: "", state: "", country: "", zip: "" };
  }

  const address = row as UnknownRecord;
  return {
    line1: asString(address.line1),
    line2: asString(address.line2),
    city: asString(address.city),
    state: asString(address.state),
    country: asString(address.country),
    zip: asString(address.zip),
  };
}

function normalizeVenue(row: unknown): Venue {
  if (!row || typeof row !== "object") {
    return {
      id: "",
      venueName: "",
      addressLine1: "",
      addressLine2: "",
      addressCity: "",
      addressState: "",
      addressCountry: "",
      addressZip: "",
    };
  }

  const venue = row as UnknownRecord;
  return {
    id: asString(venue.id),
    venueName: asString(venue.venueName),
    addressLine1: asString(venue.addressLine1),
    addressLine2: asString(venue.addressLine2),
    addressCity: asString(venue.addressCity),
    addressState: asString(venue.addressState),
    addressCountry: asString(venue.addressCountry),
    addressZip: asString(venue.addressZip),
  };
}

function normalizeEvent(row: unknown): Event {
  if (!row || typeof row !== "object") {
    return {
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
      venue: normalizeVenue(undefined),
      address: normalizeAddress(undefined),
    };
  }

  const event = row as UnknownRecord;
  return {
    id: asString(event.id),
    name: asString(event.name),
    displayName: asString(event.displayName),
    format: asString(event.format),
    city: asString(event.city),
    country: asString(event.country),
    status: asString(event.status),
    numParticipants: asNumber(event.numParticipants),
    estimatedAttendeesCount: asNumber(event.estimatedAttendeesCount),
    percentSignup: asNumber(event.percentSignup),
    hasVenue: asBoolean(event.hasVenue),
    pocName: asStringArray(event.pocName),
    pocEmail: asStringArray(event.pocEmail),
    rmName: asStringArray(event.rmName),
    rmEmail: asStringArray(event.rmEmail),
    venue: normalizeVenue(event.venue),
    address: normalizeAddress(event.address),
  };
}

function normalizeParticipant(row: unknown): Participant | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const participant = row as UnknownRecord;
  return {
    displayName: asString(participant.displayName),
    email: asString(participant.email),
    pronouns: asString(participant.pronouns) as Pronouns,
    age: asNumber(participant.age),
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
    shirtSize: asString(participant.shirtSize) as ShirtSize,
    dietaryRestrictions: asString(participant.dietaryRestrictions),
    additionalAccommodations: asString(
      participant.additionalAccommodations,
    ) as AdditionalAccommodations,
  };
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }
  return value;
}

export async function fetchParticipantsResponse(): Promise<ParticipantsResponse> {
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
  const source =
    payload && typeof payload === "object"
      ? (payload as Partial<ParticipantsAPIResponse>)
      : {};

  const participants = (Array.isArray(source.participants)
    ? source.participants
    : []
  )
    .map(normalizeParticipant)
    .filter((participant): participant is Participant => participant !== null);

  return {
    event: normalizeEvent(source.event),
    participants,
    raw: payload,
  };
}

export async function fetchParticipants(): Promise<Participant[]> {
  const response = await fetchParticipantsResponse();
  return response.participants;
}
