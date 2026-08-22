/** Formatting helpers shared across components. */

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.max(0, (Date.now() - Date.parse(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 31) return `${Math.floor(days)}d ago`;
  const months = days / 30.44;
  if (months < 12) return `${Math.floor(months)}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Dart: "#00b4ab",
  Python: "#3572a5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#a97bff",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Lua: "#000080",
  PHP: "#4f5d95",
  Ruby: "#701516",
  Swift: "#f05138",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

export function languageColor(language: string | null): string {
  if (!language) return "var(--faint)";
  return LANGUAGE_COLORS[language] ?? "var(--faint)";
}
