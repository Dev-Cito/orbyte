import { redirect } from "next/navigation";

// No landing page yet: the app itself (proxy.ts sends signed-out visitors on
// to /login).
export default function Home() {
  redirect("/app");
}
