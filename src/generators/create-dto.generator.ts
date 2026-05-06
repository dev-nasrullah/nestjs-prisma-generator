import { Project, QuoteKind, StructureKind } from "ts-morph";
import path from "path";
import fs from "fs";
import { ModelMeta } from "../types/metadata.types";
import { GeneratorConfig } from "../types/config.types";
import { buildProperties } from "./helpers/property-builder";
import { shouldIncludeRelation } from "../core/relation-resolver";

export function generateCreateDTO(
  models: ModelMeta[],
  outputDir: string,
  config: GeneratorConfig,
  depth = 0,
) {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Double,
    },
  });

  const modelsMap = new Map(models.map((m) => [m.name, m]));

  models.forEach((model) => {
    const filePath = path.join(
      outputDir,
      model.name.toLowerCase(),
      `create-${model.name.toLowerCase()}.dto.ts`,
    );

    // ensure directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true,
    });

    const enumImports = new Set<string>();
    model.fields.forEach((f) => {
      if (f.type === "enum" && f.enumName) {
        enumImports.add(f.enumName);
      }
    });

    if (enumImports.size > 0) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `../enums`,
        namedImports: Array.from(enumImports),
      });
    }

    // imports
    const validatorImports = new Set([
      "IsString",
      "IsInt",
      "IsBoolean",
      "IsDate",
      "IsOptional",
      "IsEnum",
    ]);
    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: "@nestjs/swagger",
        namedImports: ["ApiProperty", "ApiPropertyOptional"],
      },
      {
        moduleSpecifier: "class-validator",
        namedImports: Array.from(validatorImports),
      },
    ]);

    const relationImports = new Set<string>();
    const modelConfig = config.models?.[model.name];

    model.fields.forEach((f) => {
      if (
        f.type === "relation" &&
        shouldIncludeRelation(f, modelConfig, depth)
      ) {
        relationImports.add(f.relation!.model);
      }
    });

    relationImports.forEach((rel) => {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `../${rel.toLowerCase()}/create-${rel.toLowerCase()}.dto`,
        namedImports: [`Create${rel}Dto`],
      });
    });

    sourceFile.addImportDeclaration({
      moduleSpecifier: "class-validator",
      namedImports: ["ValidateNested"],
    });

    sourceFile.addImportDeclaration({
      moduleSpecifier: "class-transformer",
      namedImports: ["Type"],
    });

    // class
    sourceFile.addClass({
      name: `Create${model.name}Dto`,
      isExported: true,
      properties: buildProperties({
        model,
        modelsMap,
        config,
        depth,
        dtoType: "create",
      }) as any,
    });
  });

  project.saveSync();
}
