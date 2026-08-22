import { profile } from "../config/profile";

/** Lazy README preview (fetched only when a project modal opens). */

export async function fetchReadme(repo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${profile.username}/${repo}/readme`,
      {
        headers: { Accept: "application/vnd.github.raw" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Strip common markdown down to a plain-text preview. */
export function readmeToPlainText(md: string, max = 700): string {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^[-–—=]{3,}\s*$/gm, " ")
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.min(cut.length, cut.lastIndexOf(" ")))}…`;
}
