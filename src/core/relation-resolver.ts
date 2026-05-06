export function shouldIncludeRelation(field: any, config: any, depth: number) {
  const mode = config?.relations?.mode ?? "id";
  const maxDepth = config?.relations?.depth ?? 1;

  if (field.type !== "relation") return false;
  if (mode === "id") return false;
  if (depth >= maxDepth) return false;

  return true;
}
