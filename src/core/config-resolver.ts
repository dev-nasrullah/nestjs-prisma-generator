import path from "path";
import { GeneratorConfig } from "../types/config.types";

const DEFAULT_SCHEMA_PATH = "prisma/schema.prisma";
const DEFAULT_OUTPUT_PATH = "generated";

export function resolveSchemaPath(
  cliSchema: string | undefined,
  config: GeneratorConfig,
) {
  return cliSchema || config.schema || DEFAULT_SCHEMA_PATH;
}

export function resolveOutputPath(
  cliOutput: string | undefined,
  config: GeneratorConfig,
) {
  if (cliOutput) {
    return cliOutput;
  }

  if (typeof config.output === "string") {
    return config.output;
  }

  if (config.output?.base) {
    return config.output.base;
  }

  return DEFAULT_OUTPUT_PATH;
}

export function resolveConfigTypesOutputPath() {
  return path.join(process.cwd(), "nestjs-prisma.config.d.ts");
}
