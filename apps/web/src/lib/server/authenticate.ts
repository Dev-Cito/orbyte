import "server-only";
import type { NextRequest } from "next/server";
import type { Session } from "@/lib/api/types";
import { backendFetch, BackendUnreachableError, setSessionCookie } from "./backend";
import { rejectCrossSite } from "./same-origin";

// Shared by the login and register route handlers: forwards the credentials,
// keeps the returned JWT in the httpOnly cookie, and answers with the
// session only. The token never reaches the browser.
export async function authenticate(
  request: NextRequest,
  apiPath: "/auth/login" | "/auth/register",
): Promise<Response> {
  const refused = rejectCrossSite(request);
  if (refused) return refused;

  let res: Response;
  try {
    res = await backendFetch(apiPath, {
      method: "POST",
      body: await request.text(),
      auth: false,
    });
  } catch (err) {
    if (err instanceof BackendUnreachableError) return unreachable();
    throw err;
  }

  const body = (await res.json().catch(() => null)) as
    | (Session & { token: string })
    | Record<string, unknown>
    | null;
  // API errors (401 Invalid credentials, 409 Email already registered, 400
  // validation) are passed through as they are, for display.
  if (!res.ok) return Response.json(body, { status: res.status });

  const { token, ...session } = body as Session & { token: string };
  await setSessionCookie(token);
  return Response.json(session satisfies Session);
}

export function unreachable(): Response {
  return Response.json(
    { statusCode: 502, message: "The service is unreachable. Please try again shortly." },
    { status: 502 },
  );
}
