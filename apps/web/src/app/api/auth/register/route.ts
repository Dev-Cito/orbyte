import type { NextRequest } from "next/server";
import { authenticate } from "@/lib/server/authenticate";

// The API creates the user, their organization and the owner membership in
// one transaction; this only keeps the resulting session.
export function POST(request: NextRequest) {
  return authenticate(request, "/auth/register");
}
