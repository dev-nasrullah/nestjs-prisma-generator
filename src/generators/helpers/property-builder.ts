import { StructureKind } from "ts-morph";
import { shouldIncludeRelation } from "../../core/relation-resolver";
import { ModelMeta } from "../../types/metadata.types";
import { mapTsType } from "../../utils/map-ts-type.util";
import { buildDecorators } from "../../utils/build-decorator.util";
import {
  DtoType,
  getDtoClassName,
  getLoaderName,
} from "./relation-dto.util";

export function buildProperties({
  model,
  modelsMap,
  config,
  currentDepth,
  dtoType,
}: {
  model: ModelMeta;
  modelsMap: Map<string, ModelMeta>;
  config: any;
  currentDepth: number;
  dtoType: DtoType;
}) {
  const modelConfig = config.models?.[model.name];

  return model.fields
    .filter((f) => {
      if (f.isId) return false;

      if (f.type === "relation") {
        return shouldIncludeRelation(f, modelConfig, currentDepth);
      }

      return true;
    })
    .map((field) => {
      // 🔁 RELATION FIELD
      if (field.type === "relation") {
        const relatedModel = modelsMap.get(field.relation?.model!);
        const relatedDto = getDtoClassName(
          field.relation?.model!,
          dtoType,
          currentDepth + 1,
        );
        const loaderName = getLoaderName(relatedDto);

        if (!relatedModel) {
          throw new Error(
            `Related model "${field.relation?.model}" not found for field "${model.name}.${field.name}"`,
          );
        }

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
              arguments: [`() => ${loaderName}()`],
            },
            {
              name: field.required ? "ApiProperty" : "ApiPropertyOptional",
              arguments: [
                field.isArray
                  ? `{ type: () => ${loaderName}(), isArray: true }`
                  : `{ type: () => ${loaderName}() }`,
              ],
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
