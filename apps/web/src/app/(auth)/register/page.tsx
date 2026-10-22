import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-fg-secondary">
        Start free with up to 3 projects. Upgrade anytime.
      </p>
      <RegisterForm />
    </Card>
  );
}
