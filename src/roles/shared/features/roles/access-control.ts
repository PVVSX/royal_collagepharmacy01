import type { PortalSession } from "./mock-login";

export type PortalArea = "member" | "admin";

export function canPortalSessionAccessArea(
  session: PortalSession | null,
  area: PortalArea,
  pathname: string,
) {
  if (!session) return false;

  if (area === "member") {
    return session.role === "member" && pathname.startsWith("/member/");
  }

  if (!pathname.startsWith("/admin/")) return false;
  if (session.role === "super_admin") return true;
  if (session.role === "finance_officer") return pathname.startsWith("/admin/finance");
  if (session.role === "staff") {
    return !pathname.startsWith("/admin/settings") && !pathname.startsWith("/admin/terms");
  }
  return false;
}
