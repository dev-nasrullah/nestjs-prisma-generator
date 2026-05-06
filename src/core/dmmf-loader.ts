import { getDMMF, getSchemaWithPath, GetSchemaResult } from "@prisma/internals";
import path from "path";

export async function loadSchema(schemaPath?: string): Promise<GetSchemaResult> {
  const resolvedPath =
    schemaPath || path.join(process.cwd(), "prisma/schema.prisma");

  return getSchemaWithPath({
    schemaPath: {
      cliProvidedPath: resolvedPath,
    },
  });
}

export async function loadDMMF(schemaPath?: string) {
  const schema = await loadSchema(schemaPath);

  const dmmf = await getDMMF({
    datamodel: schema.schemas,
  });

  return dmmf;
}
