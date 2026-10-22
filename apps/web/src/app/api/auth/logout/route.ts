import type { NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/server/backend";
import { rejectCrossSite } from "@/lib/server/same-origin";

export async function POST(request: NextRequest) {
  const refused = rejectCrossSite(request);
  if (refused) return refused;
  await clearSessionCookie();
  return new Response(null, { status: 204 });
}
