/**
 * Server-side session helper
 * --------------------------
 * Thin wrapper so pages/actions can call `getSession()` instead of repeating
 * `getServerSession(authOptions)` everywhere.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function getSession() {
  return getServerSession(authOptions);
}
