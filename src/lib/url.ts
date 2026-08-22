/**
 * Only http(s) URLs may become hrefs. Guards against attacker-shaped
 * values (e.g. `javascript:...`) coming from GitHub API fields.
 */
export function safeHttpUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}
