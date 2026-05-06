export function getRelationMode(config: any) {
  return config?.relations?.mode ?? "object";
}

export function getRelationDepth(config: any) {
  return config?.relations?.depth ?? 1;
}

export function shouldIncludeRelation(field: any, config: any, depth: number) {
  const mode = getRelationMode(config);
  const maxDepth = getRelationDepth(config);

  if (field.type !== "relation") return false;
  if (mode === "id") return false;
  if (depth >= maxDepth) return false;

  return true;
}
