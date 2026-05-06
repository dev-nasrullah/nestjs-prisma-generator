import { Project } from "ts-morph";
import path from "path";
import fs from "fs";
import { ModelMeta } from "../types/metadata.types";
import {
  getRelationDepth,
  shouldIncludeRelation,
} from "../core/relation-resolver";
import { GeneratorConfig } from "../types/config.types";
import { buildProperties } from "./helpers/property-builder";
import {
  getDtoClassName,
  getDtoModuleSpecifier,
  getLoaderName,
} from "./helpers/relation-dto.util";

export function generateResponseDTO(
  models: ModelMeta[],
  outputDir: string,
  config: GeneratorConfig,
) {
  const project = new Project();

  const modelsMap = new Map(models.map((m) => [m.name, m]));
  const maxRelationDepth = Math.max(
    1,
    ...models.map((model) => getRelationDepth(config.models?.[model.name])),
  );

  models.forEach((model) => {
    const folder = path.join(outputDir, model.name.toLowerCase());
    const filePath = path.join(
      folder,
      `${model.name.toLowerCase()}.response.dto.ts`,
    );

    fs.mkdirSync(folder, { recursive: true });

    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true,
    });

    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: "@nestjs/swagger",
        namedImports: ["ApiProperty", "ApiPropertyOptional"],
      },
      {
        moduleSpecifier: "class-validator",
        namedImports: [
          "IsString",
          "IsInt",
          "IsBoolean",
          "IsDate",
          "IsOptional",
          "IsEnum",
          "ValidateNested",
        ],
      },
      {
        moduleSpecifier: "class-transformer",
        namedImports: ["Exclude", "Type"],
      },
    ]);

    const enumImports = new Set<string>();
    model.fields.forEach((field) => {
      if (field.type === "enum" && field.enumName) {
        enumImports.add(field.enumName);
      }
    });

    if (enumImports.size > 0) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: "../enums",
        namedImports: Array.from(enumImports),
      });
    }

    const modelConfig = config.models?.[model.name];
    const relationImports = new Map<string, Set<string>>();
    const relationLoaders = new Map<
      string,
      { className: string; moduleSpecifier: string }
    >();

    for (let currentDepth = 0; currentDepth <= maxRelationDepth; currentDepth++) {
      model.fields.forEach((field) => {
        if (
          field.type !== "relation" ||
          !shouldIncludeRelation(field, modelConfig, currentDepth)
        ) {
          return;
        }

        const className = getDtoClassName(
          field.relation!.model,
          "response",
          currentDepth + 1,
        );
        const moduleSpecifier = getDtoModuleSpecifier(
          field.relation!.model,
          "response",
        );

        if (!relationImports.has(moduleSpecifier)) {
          relationImports.set(moduleSpecifier, new Set<string>());
        }

        relationImports.get(moduleSpecifier)!.add(className);
        relationLoaders.set(className, { className, moduleSpecifier });
      });
    }

    relationImports.forEach((classNames, moduleSpecifier) => {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: Array.from(classNames),
        isTypeOnly: true,
      });
    });

    relationLoaders.forEach(({ className, moduleSpecifier }) => {
      sourceFile.addFunction({
        name: getLoaderName(className),
        returnType: `typeof import("${moduleSpecifier}").${className}`,
        statements: [`return require("${moduleSpecifier}").${className};`],
      });
    });

    for (let currentDepth = 0; currentDepth <= maxRelationDepth; currentDepth++) {
      sourceFile.addClass({
        name: getDtoClassName(model.name, "response", currentDepth),
        isExported: true,
        decorators: [
          {
            name: "Exclude",
            arguments: [],
          },
        ],
        properties: buildProperties({
          model,
          config,
          currentDepth,
          modelsMap,
          dtoType: "response",
        }) as any,
      });
    }
  });

  project.saveSync();
}
