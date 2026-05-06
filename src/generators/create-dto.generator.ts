import { Project, QuoteKind } from "ts-morph";
import path from "path";
import fs from "fs";
import { ModelMeta } from "../types/metadata.types";
import { GeneratorConfig } from "../types/config.types";
import { buildProperties } from "./helpers/property-builder";
import {
  getRelationDepth,
  shouldIncludeRelation,
} from "../core/relation-resolver";
import {
  getDtoClassName,
  getDtoModuleSpecifier,
  getLoaderName,
} from "./helpers/relation-dto.util";

export function generateCreateDTO(
  models: ModelMeta[],
  outputDir: string,
  config: GeneratorConfig,
) {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Double,
    },
  });

  const modelsMap = new Map(models.map((m) => [m.name, m]));
  const maxRelationDepth = Math.max(
    1,
    ...models.map((model) => getRelationDepth(config.models?.[model.name])),
  );

  models.forEach((model) => {
    const filePath = path.join(
      outputDir,
      model.name.toLowerCase(),
      `create-${model.name.toLowerCase()}.dto.ts`,
    );

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
        moduleSpecifier: "../enums",
        namedImports: Array.from(enumImports),
      });
    }

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
        namedImports: ["Type"],
      },
    ]);

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
          "create",
          currentDepth + 1,
        );
        const moduleSpecifier = getDtoModuleSpecifier(
          field.relation!.model,
          "create",
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
        name: getDtoClassName(model.name, "create", currentDepth),
        isExported: true,
        properties: buildProperties({
          model,
          modelsMap,
          config,
          currentDepth,
          dtoType: "create",
        }) as any,
      });
    }
  });

  project.saveSync();
}
