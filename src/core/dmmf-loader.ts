import { getDMMF } from "@prisma/internals";
import fs from "fs/promises";
import path from "path";

export async function loadDMMF(schemaPath?: string) {
  const resolvedPath =
    schemaPath || path.join(process.cwd(), "prisma/schema.prisma");

  const schema = await fs.readFile(resolvedPath, "utf-8");

  const dmmf = await getDMMF({
    datamodel: schema,
  });

  return dmmf;
}
