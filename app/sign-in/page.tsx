import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SignInButton } from "@/components/sign-in-button";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { isEmailAllowlisted } from "@/lib/email-allowlist";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAllowlisted = session ? isEmailAllowlisted(session.user.email) : false;

  if (session && isAllowlisted) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Campfire Participants Dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sign in to access participant data and event summaries.
      </p>
      {session && !isAllowlisted ? (
        <div className="space-y-3">
          <p className="text-sm text-red-600 dark:text-red-400">
            This account is signed in, but the email is not allowlisted for dashboard access.
          </p>
          <SignOutButton />
        </div>
      ) : (
        <SignInButton />
      )}
      {params.error === "not-allowed" ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          Your email is not allowlisted for this dashboard.
        </p>
      ) : null}
    </main>
  );
}
