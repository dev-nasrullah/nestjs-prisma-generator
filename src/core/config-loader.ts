import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import { createRequire } from "module";
import { GeneratorConfig } from "../types/config.types";

const CONFIG_CANDIDATES = [
  "nestjs-prisma.config.ts",
  "nestjs-prisma.config.js",
  "nestjs-prisma.config.cjs",
  "nestjs-prisma.config.mjs",
] as const;

function resolveConfigPath() {
  for (const fileName of CONFIG_CANDIDATES) {
    const filePath = path.join(process.cwd(), fileName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

function isTypeScriptConfig(configPath: string) {
  return configPath.endsWith(".ts");
}

async function loadModule(configPath: string) {
  const requireFromCwd = createRequire(
    path.join(process.cwd(), "package.json"),
  );

  if (configPath.endsWith(".mjs")) {
    return import(pathToFileURL(configPath).href);
  }

  if (isTypeScriptConfig(configPath)) {
    require("ts-node/register/transpile-only");
  }

  return requireFromCwd(configPath);
}

export async function loadConfig(): Promise<GeneratorConfig> {
  const configPath = resolveConfigPath();

  if (!configPath) {
    return {};
  }

  try {
    const mod = await loadModule(configPath);
    return mod.default || mod;
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Unknown config loading error";

    throw new Error(
      `Failed to load config file "${path.basename(configPath)}": ${reason}`,
    );
  }
}
