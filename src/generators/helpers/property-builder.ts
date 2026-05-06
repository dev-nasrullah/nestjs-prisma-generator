import { StructureKind } from "ts-morph";
import { shouldIncludeRelation } from "../../core/relation-resolver";
import { ModelMeta } from "../../types/metadata.types";
import { mapTsType } from "../../utils/map-ts-type.util";
import { buildDecorators } from "../../utils/build-decorator.util";

export function buildProperties({
  model,
  modelsMap,
  config,
  depth,
}: {
  model: ModelMeta;
  modelsMap: Map<string, ModelMeta>;
  config: any;
  depth: number;
}) {
  const modelConfig = config.models?.[model.name];

  return model.fields
    .filter((f) => {
      if (f.isId) return false;

      if (f.type === "relation") {
        return shouldIncludeRelation(f, modelConfig, depth);
      }

      return true;
    })
    .map((field) => {
      // 🔁 RELATION FIELD
      if (field.type === "relation") {
        const relatedModel = modelsMap.get(field.relation?.model!);
        const relatedDto = `Create${field.relation?.model}Dto`;

        return {
          kind: StructureKind.Property,
          name: field.name,
          type: field.isArray ? `${relatedDto}[]` : relatedDto,
          hasQuestionToken: !field.required,
          decorators: [
            {
              name: "ValidateNested",
              arguments: field.isArray ? ["{ each: true }"] : [],
            },
            {
              name: "Type",
              arguments: [`() => ${relatedDto}`],
            },
            {
              name: "ApiProperty",
              arguments: field.isArray ? ["{ isArray: true }"] : [],
            },
          ],
        };
      }

      // 🧱 SCALAR / ENUM (reuse existing logic)
      return {
        kind: StructureKind.Property,
        name: field.config?.rename || field.name,
        hasQuestionToken: !field.required,
        type: mapTsType(field),
        decorators: buildDecorators(field),
      };
    });
}
