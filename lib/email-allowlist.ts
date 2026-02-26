import "server-only";

const allowedEmailsRaw = process.env.ALLOWED_EMAILS;

if (!allowedEmailsRaw) {
  throw new Error("Missing ALLOWED_EMAILS environment variable.");
}

const parsedAllowedEmails = allowedEmailsRaw
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

if (parsedAllowedEmails.length === 0) {
  throw new Error("ALLOWED_EMAILS must contain at least one email address.");
}

const allowedEmails = new Set(parsedAllowedEmails);

export function isEmailAllowlisted(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return allowedEmails.has(email.trim().toLowerCase());
}
