import { Project, StructureKind } from "ts-morph";
import path from "path";
import fs from "fs";
import { ModelMeta } from "../types/metadata.types";
import { mapTsType } from "../utils/map-ts-type.util";
import { buildSwaggerDecorator } from "../utils/build-swagger-decorator.util";
import { shouldIncludeRelation } from "../core/relation-resolver";
import { GeneratorConfig } from "../types/config.types";
import { buildProperties } from "./helpers/property-builder";

export function generateResponseDTO(
  models: ModelMeta[],
  outputDir: string,
  config: GeneratorConfig,
  depth = 0,
) {
  const project = new Project();

  const modelsMap = new Map(models.map((m) => [m.name, m]));

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

    // imports
    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: "@nestjs/swagger",
        namedImports: ["ApiProperty", "ApiPropertyOptional"],
      },
      {
        moduleSpecifier: "class-transformer",
        namedImports: ["Expose"],
      },
    ]);

    // enum imports
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
      name: `${model.name}ResponseDto`,
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
        depth,
        modelsMap,
      }) as any,
    });
  });

  project.saveSync();
}
