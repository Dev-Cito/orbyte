import type { NextRequest } from "next/server";
import { authenticate } from "@/lib/server/authenticate";

export function POST(request: NextRequest) {
  return authenticate(request, "/auth/login");
}
