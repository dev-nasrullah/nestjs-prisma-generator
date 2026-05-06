// src/core/metadata-builder.ts
import { DMMF } from "@prisma/generator-helper";
import {
  ModelMeta,
  FieldMeta,
  EnumMeta,
  FullMetadata,
} from "../types/metadata.types";
import { GeneratorConfig } from "../types/config.types";

function mapPrismaType(field: DMMF.Field): FieldMeta["type"] {
  if (field.kind === "object") return "relation";
  if (field.kind === "enum") return "enum";

  switch (field.type) {
    case "String":
      return "string";
    case "Int":
    case "Float":
    case "Decimal":
      return "number";
    case "Boolean":
      return "boolean";
    case "DateTime":
      return "date";
    default:
      return "string";
  }
}

export function buildMetadata(
  dmmf: DMMF.Document,
  config: GeneratorConfig,
): FullMetadata {
  const models: ModelMeta[] = dmmf.datamodel.models.map((model) => {
    const modelConfig = config.models?.[model.name];

    const fields: FieldMeta[] = model.fields.map((field) => {
      const fieldConfig = modelConfig?.fields?.[field.name] || {};

      return {
        name: field.name,
        type: mapPrismaType(field),
        required: field.isRequired,
        isArray: field.isList,
        isId: field.isId,
        isUnique: field.isUnique,
        relation:
          field.kind === "object" ? { model: field.type as string } : undefined,
        enumName: field.kind === "enum" ? (field.type as string) : undefined,

        config: fieldConfig,
      };
    });

    return {
      name: model.name,
      fields,
    };
  });

  const enums = dmmf.datamodel.enums.map((e) => ({
    name: e.name,
    values: e.values.map((v) => v.name),
  }));

  return { models, enums };
}
