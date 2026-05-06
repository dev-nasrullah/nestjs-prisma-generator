import { Project, QuoteKind } from "ts-morph";
import path from "path";
import fs from "fs";
import { ModelMeta } from "../types/metadata.types";

export function generateUpdateDTO(models: ModelMeta[], outputDir: string) {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Double,
    },
  });

  models.forEach((model) => {
    const folder = path.join(outputDir, model.name.toLowerCase());

    const filePath = path.join(
      folder,
      `update-${model.name.toLowerCase()}.dto.ts`,
    );

    fs.mkdirSync(folder, { recursive: true });

    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true,
    });

    // Import PartialType
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@nestjs/mapped-types",
      namedImports: ["PartialType"],
    });

    // Import Create DTO (relative path resolution)
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./create-${model.name.toLowerCase()}.dto`,
      namedImports: [`Create${model.name}Dto`],
    });

    // Class generation
    sourceFile.addClass({
      name: `Update${model.name}Dto`,
      isExported: true,
      extends: `PartialType(Create${model.name}Dto)`,
    });
  });

  project.saveSync();
}
