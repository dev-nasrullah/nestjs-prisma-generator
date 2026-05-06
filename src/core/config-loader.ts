import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { GeneratorConfig } from "../types/config.types";

export async function loadConfig(): Promise<GeneratorConfig> {
  const configPath = path.join(process.cwd(), "nestjs-prisma.config.ts");
  const requireFromCwd = createRequire(
    path.join(process.cwd(), "package.json"),
  );

  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }

    requireFromCwd("ts-node/register/transpile-only");
    const mod = requireFromCwd(configPath);

    return mod.default || {};
  } catch {
    return {};
  }
}
