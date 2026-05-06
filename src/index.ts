import { Command } from "commander";
import { loadDMMF } from "./core/dmmf-loader";
import { buildMetadata } from "./core/metadata-builder";
import { loadConfig } from "./core/config-loader";
import {
  resolveOutputPath,
  resolveSchemaPath,
} from "./core/config-resolver";

import { generateEnums } from "./generators/enum.generator";
import { generateCreateDTO } from "./generators/create-dto.generator";
import { generateUpdateDTO } from "./generators/update-dto.generator";
import { generateResponseDTO } from "./generators/response-dto.generator";
import { generateConfigTypes } from "./generators/config-types.generator";

const program = new Command();

program
  .name("nestjs-prisma-gen")
  .description("Generate DTOs from Prisma schema")
  .version("0.1.0");

program
  .command("generate")
  .option("-s, --schema <path>", "Prisma schema path")
  .option("-o, --output <path>", "Output directory")
  .option("-m, --models <models>", "Comma separated model names")
  .option("-w, --watch", "Watch schema and regenerate")
  .action(async (options) => {
    const config = await loadConfig();
    const schemaPath = resolveSchemaPath(options.schema, config);
    const outputPath = resolveOutputPath(options.output, config);

    const run = async () => {
      const dmmf = await loadDMMF(schemaPath);
      generateConfigTypes(dmmf);

      const meta = buildMetadata(dmmf, config);

      let models = meta.models;

      // 🎯 Model filtering
      if (options.models) {
        const selected = options.models.split(",").map((m: string) => m.trim());
        models = models.filter((m) => selected.includes(m.name));
      }

      console.log(
        `Generating DTOs for: ${models.map((m) => m.name).join(", ")}`,
      );

      generateEnums(meta.enums, outputPath);
      generateCreateDTO(models, outputPath, config);
      generateUpdateDTO(models, outputPath);
      generateResponseDTO(models, outputPath, config);

      console.log("✅ Generation complete");
    };

    await run();

    // 👀 Watch mode
    if (options.watch) {
      console.log("👀 Watching for changes...");

      const chokidar = await import("chokidar");

      const watcher = chokidar.watch(schemaPath, {
        ignoreInitial: true,
      });

      watcher.on("change", async () => {
        console.log("🔄 Schema changed. Regenerating...");
        await run();
      });
    }
  });

program.parse();
