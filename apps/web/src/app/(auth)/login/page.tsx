import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Sign in</h1>
      <p className="mb-6 mt-1 text-sm text-fg-secondary">Welcome back to your workspace.</p>
      {/* The form reads ?next and ?expired from the URL. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </Card>
  );
}
