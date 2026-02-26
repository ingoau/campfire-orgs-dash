import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignInButton } from "@/components/sign-in-button";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Campfire Participants Dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sign in to access participant data and event summaries.
      </p>
      <SignInButton />
    </main>
  );
}
