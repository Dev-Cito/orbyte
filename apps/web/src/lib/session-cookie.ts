// Shared by proxy.ts and the server code. Holds the API's JWT, httpOnly so
// that no script (and so no XSS) can read it.
export const SESSION_COOKIE = "orbyte_session";
