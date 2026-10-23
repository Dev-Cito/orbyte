import { Logo } from "@/components/brand/logo";
import type { ReactNode } from "react";

// Light pages (#F9FAFB) for signing in and up, in the same family as the app.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-6 py-6">
        <Logo height={32} />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
