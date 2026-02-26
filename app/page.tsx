import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isEmailAllowlisted } from "@/lib/email-allowlist";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && isEmailAllowlisted(session.user.email)) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}
