import { Project } from "ts-morph";
import path from "path";
import fs from "fs";
import { ModelMeta } from "../types/metadata.types";
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
        moduleSpecifier: "class-validator",
        namedImports: [
          "IsString",
          "IsInt",
          "IsBoolean",
          "IsDate",
          "IsOptional",
          "IsEnum",
        ],
      },
      {
        moduleSpecifier: "class-transformer",
        namedImports: ["Exclude"],
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
        moduleSpecifier: `../${rel.toLowerCase()}/${rel.toLowerCase()}.response.dto`,
        namedImports: [`${rel}ResponseDto`],
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
        dtoType: "response",
      }) as any,
    });
  });

  project.saveSync();
}
