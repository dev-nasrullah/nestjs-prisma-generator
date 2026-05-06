import { Project } from "ts-morph";
import path from "path";
import fs from "fs";
import { EnumMeta } from "../types/metadata.types";

export function generateEnums(enums: EnumMeta[], outputDir: string) {
  const project = new Project();

  const enumDir = path.join(outputDir, "enums");
  fs.mkdirSync(enumDir, { recursive: true });

  enums.forEach((e) => {
    const filePath = path.join(enumDir, `${e.name}.enum.ts`);

    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true,
    });

    sourceFile.addEnum({
      name: e.name,
      isExported: true,
      members: e.values.map((v) => ({
        name: v,
        value: v,
      })),
    });
  });

  project.saveSync();
}
