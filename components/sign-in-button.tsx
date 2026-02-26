"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
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
      <Button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Sign in with Hack Club"}
      </Button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
