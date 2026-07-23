/** Build /admin/dashboard URLs from serializable search params (safe for Client Components). */
export function adminDashboardHref(
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/admin/dashboard?${qs}` : "/admin/dashboard";
}
