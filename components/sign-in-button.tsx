"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.oauth2({
      providerId: "hackclub",
      callbackURL: "/dashboard",
    });

    if (result.error) {
      setLoading(false);
      setError("Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "Redirecting..." : "Sign in with Hack Club"}
      </button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
