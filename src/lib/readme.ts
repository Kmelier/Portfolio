import { profile } from "../config/profile";
import { REQUEST_TIMEOUT_MS } from "./github";

/** README loading + a tiny structured markdown parser (no dependencies). */

export async function fetchReadme(repo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${profile.username}/${repo}/readme`,
      {
        headers: { Accept: "application/vnd.github.raw" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export type ReadmeBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; text: string }
  | { type: "quote"; text: string };

const STRUCTURAL = /^(#{1,6}\s|```|>|\s*[-*+]\s|\s*\d+\.\s)/;

/**
 * Parses the common README markdown subset — headings, paragraphs,
 * bullet/numbered lists, fenced code, blockquotes — into blocks.
 * Anything exotic degrades gracefully into paragraphs.
 */
export function parseReadme(md: string): ReadmeBlock[] {
  const lines = md
    .replace(/\r/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images → nothing
    .split("\n");
  const blocks: ReadmeBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push({ type: "code", text: buf.join("\n") });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: Math.min(3, heading[1].length) as 1 | 2 | 3,
        text: heading[2],
      });
      i++;
      continue;
    }

    const bullet = /^\s*[-*+]\s+/.test(line);
    const numbered = /^\s*\d+\.\s+/.test(line);
    if (bullet || numbered) {
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i];
        const isBullet = /^\s*[-*+]\s+/.test(current);
        const isNumbered = /^\s*\d+\.\s+/.test(current);
        if (isBullet || (numbered && isNumbered)) {
          items.push(current.replace(/^\s*(?:[-*+]|\d+\.)\s+/, ""));
          i++;
        } else if (!current.trim() && /^\s*[-*+]|\s*\d+\./.test(lines[i + 1] ?? "")) {
          i++; // blank line inside a loose list
        } else {
          break;
        }
      }
      blocks.push({ type: "list", ordered: numbered, items });
      continue;
    }

    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: buf.join(" ") });
      continue;
    }

    if (/^\s*(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
      i++; // horizontal rule → skip
      continue;
    }

    const buf = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !STRUCTURAL.test(lines[i]) &&
      !lines[i].startsWith("```")
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: buf.join(" ") });
  }

  return blocks;
}
