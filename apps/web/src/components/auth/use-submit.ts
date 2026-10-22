"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";

// Runs an auth call and keeps a displayable error message.
export function useSubmit() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setPending(false);
    }
    // On success the page navigates away: stay pending until it does.
  }

  return { pending, error, run };
}
