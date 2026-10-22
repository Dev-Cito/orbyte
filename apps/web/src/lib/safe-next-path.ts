// A post-login redirect target, only if it is a path inside this app.
// Rejects absolute and protocol-relative URLs ("//evil.com"): no open
// redirect through ?next=.
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  return value;
}
