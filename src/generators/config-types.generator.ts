import fs from "fs";
import path from "path";
import { DMMF } from "@prisma/generator-helper";

function buildFieldUnion(model: DMMF.Model) {
  if (model.fields.length === 0) {
    return "never";
  }

  return model.fields.map((field) => `"${field.name}"`).join(" | ");
}

export function generateConfigTypes(
  dmmf: DMMF.Document,
  outputPath = path.join(process.cwd(), "nestjs-prisma.config.d.ts"),
) {
  const schemaShape =
    dmmf.datamodel.models.length === 0
      ? "Record<string, never>"
      : `{
${dmmf.datamodel.models
  .map((model) => `  ${model.name}: ${buildFieldUnion(model)};`)
  .join("\n")}
}`;

  const content = `import type { GeneratorConfigForSchema } from "nestjs-prisma-generator/config";

declare global {
  type NestjsPrismaSchema = ${schemaShape};
  type NestjsPrismaConfig = GeneratorConfigForSchema<NestjsPrismaSchema>;
}

export {};
`;

  fs.writeFileSync(outputPath, content);
}
