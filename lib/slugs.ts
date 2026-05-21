export function buildIdPrefixedSlug(id: number, label: string | null | undefined, fallback = "item"): string {
  const slug = (label ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\p{Mark}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return `${id}-${slug || fallback}`;
}

export function buildPlannerHref(id: number, name: string | null | undefined): string {
  return `/planner/${buildIdPrefixedSlug(id, name, "planner")}`;
}

export function parseIdPrefixedSlug(value: string): number | null {
  const match = value.match(/^(\d+)(?:-|$)/);
  if (!match) {
    return null;
  }

  const id = Number.parseInt(match[1], 10);
  return Number.isNaN(id) ? null : id;
}
