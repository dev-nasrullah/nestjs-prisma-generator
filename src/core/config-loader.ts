import path from "path";

export async function loadConfig(): Promise<any> {
  const configPath = path.join(process.cwd(), "nestjs-prisma.config.ts");

  try {
    const mod = await import(configPath);
    return mod.default || {};
  } catch {
    return {};
  }
}
