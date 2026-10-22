"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { ErrorAlert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { safeNextPath } from "@/lib/safe-next-path";
import { useSubmit } from "./use-submit";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next")) ?? "/app";
  const expired = params.get("expired") === "1";
  const { pending, error, run } = useSubmit();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(async () => {
      await authApi.login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      router.replace(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="flex flex-col gap-5">
      {expired && !error && (
        <p role="status" className="rounded-xl border border-border bg-surface-subtle px-3.5 py-3 text-sm text-fg-secondary">
          Your session has ended. Please sign in again.
        </p>
      )}
      {error && <ErrorAlert>{error}</ErrorAlert>}
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input label="Password" name="password" type="password" autoComplete="current-password" required />
      <Button type="submit" loading={pending} fullWidth>
        Sign in
      </Button>
      <p className="text-center text-sm text-fg-secondary">
        New to Orbyte?{" "}
        <Link href="/register" className="font-semibold text-fg underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}
