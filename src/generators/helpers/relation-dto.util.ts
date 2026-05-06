export type DtoType = "create" | "response";

export function getDtoClassName(
  modelName: string,
  dtoType: DtoType,
  depth: number,
) {
  if (dtoType === "create") {
    return depth === 0
      ? `Create${modelName}Dto`
      : `Create${modelName}RelationDtoDepth${depth}`;
  }

  return depth === 0
    ? `${modelName}ResponseDto`
    : `${modelName}ResponseRelationDtoDepth${depth}`;
}

export function getDtoModuleSpecifier(modelName: string, dtoType: DtoType) {
  const base = `../${modelName.toLowerCase()}`;

  return dtoType === "create"
    ? `${base}/create-${modelName.toLowerCase()}.dto`
    : `${base}/${modelName.toLowerCase()}.response.dto`;
}

export function getLoaderName(className: string) {
  return `load${className}`;
}
