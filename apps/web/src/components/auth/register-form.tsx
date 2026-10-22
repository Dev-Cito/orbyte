"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { ErrorAlert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useSubmit } from "./use-submit";

export function RegisterForm() {
  const router = useRouter();
  const { pending, error, run } = useSubmit();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(async () => {
      // One call: the API creates the account, the organization and the
      // owner membership together.
      await authApi.register({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        organizationName: String(form.get("organizationName")),
      });
      router.replace("/app");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error && <ErrorAlert>{error}</ErrorAlert>}
      <Input label="Your name" name="name" autoComplete="name" required maxLength={100} />
      <Input label="Work email" name="email" type="email" autoComplete="email" required maxLength={254} />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="At least 8 characters."
      />
      <Input
        label="Organization name"
        name="organizationName"
        autoComplete="organization"
        required
        maxLength={100}
        hint="Your workspace. You will be its owner."
      />
      <Button type="submit" loading={pending} fullWidth>
        Create account
      </Button>
      <p className="text-center text-sm text-fg-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-fg underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
