import {
  __commonJS,
  __esm
} from "./chunk-X6BYQHVC.mjs";

// src/core/dmmf-loader.ts
import { getDMMF } from "@prisma/internals";
import fs from "fs/promises";
import path from "path";
async function loadDMMF(schemaPath) {
  const resolvedPath = schemaPath || path.join(process.cwd(), "prisma/schema.prisma");
  const schema = await fs.readFile(resolvedPath, "utf-8");
  const dmmf = await getDMMF({
    datamodel: schema
  });
  return dmmf;
}
var init_dmmf_loader = __esm({
  "src/core/dmmf-loader.ts"() {
    "use strict";
  }
});

// src/core/metadata-builder.ts
function mapPrismaType(field) {
  if (field.kind === "object") return "relation";
  if (field.kind === "enum") return "enum";
  switch (field.type) {
    case "String":
      return "string";
    case "Int":
    case "Float":
    case "Decimal":
      return "number";
    case "Boolean":
      return "boolean";
    case "DateTime":
      return "date";
    default:
      return "string";
  }
}
function buildMetadata(dmmf, config) {
  const models = dmmf.datamodel.models.map((model) => {
    const modelConfig = config.models?.[model.name];
    const fields = model.fields.map((field) => {
      const fieldConfig = modelConfig?.fields?.[field.name] || {};
      return {
        name: field.name,
        type: mapPrismaType(field),
        required: field.isRequired,
        isArray: field.isList,
        isId: field.isId,
        isUnique: field.isUnique,
        relation: field.kind === "object" ? { model: field.type } : void 0,
        enumName: field.kind === "enum" ? field.type : void 0,
        config: fieldConfig
      };
    });
    return {
      name: model.name,
      fields
    };
  });
  const enums = dmmf.datamodel.enums.map((e) => ({
    name: e.name,
    values: e.values.map((v) => v.name)
  }));
  return { models, enums };
}
var init_metadata_builder = __esm({
  "src/core/metadata-builder.ts"() {
    "use strict";
  }
});

// src/core/config-loader.ts
import path2 from "path";
async function loadConfig() {
  const configPath = path2.join(process.cwd(), "nestjs-prisma.config.ts");
  try {
    const mod = await import(configPath);
    return mod.default || {};
  } catch {
    return {};
  }
}
var init_config_loader = __esm({
  "src/core/config-loader.ts"() {
    "use strict";
  }
});

// src/generators/enum.generator.ts
import { Project } from "ts-morph";
import path3 from "path";
import fs2 from "fs";
function generateEnums(enums, outputDir) {
  const project = new Project();
  const enumDir = path3.join(outputDir, "enums");
  fs2.mkdirSync(enumDir, { recursive: true });
  enums.forEach((e) => {
    const filePath = path3.join(enumDir, `${e.name}.enum.ts`);
    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true
    });
    sourceFile.addEnum({
      name: e.name,
      isExported: true,
      members: e.values.map((v) => ({
        name: v,
        value: v
      }))
    });
  });
  project.saveSync();
}
var init_enum_generator = __esm({
  "src/generators/enum.generator.ts"() {
    "use strict";
  }
});

// src/utils/map-ts-type.util.ts
function mapTsType(field) {
  if (field.type === "enum") {
    return field.enumName;
  }
  switch (field.type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "date":
      return "Date";
    default:
      return "any";
  }
}
var init_map_ts_type_util = __esm({
  "src/utils/map-ts-type.util.ts"() {
    "use strict";
  }
});

// src/utils/build-decorator.util.ts
function buildDecorators(field) {
  const decorators = [];
  if (field.type === "enum") {
    decorators.push({
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: [`{ enum: ${field.enumName} }`]
    });
  } else {
    decorators.push({
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: []
    });
  }
  if (field.type === "enum") {
    decorators.push({
      name: "IsEnum",
      arguments: [field.enumName]
    });
  } else {
    switch (field.type) {
      case "string":
        decorators.push({ name: "IsString", arguments: [] });
        break;
      case "number":
        decorators.push({ name: "IsInt", arguments: [] });
        break;
      case "boolean":
        decorators.push({ name: "IsBoolean", arguments: [] });
        break;
      case "date":
        decorators.push({ name: "IsDate", arguments: [] });
        break;
    }
  }
  if (!field.required) {
    decorators.push({ name: "IsOptional", arguments: [] });
  }
  return decorators;
}
var init_build_decorator_util = __esm({
  "src/utils/build-decorator.util.ts"() {
    "use strict";
  }
});

// src/generators/create-dto.generator.ts
import { Project as Project2, QuoteKind, StructureKind } from "ts-morph";
import path4 from "path";
import fs3 from "fs";
function generateCreateDTO(models, outputDir) {
  const project = new Project2({
    manipulationSettings: {
      quoteKind: QuoteKind.Double
    }
  });
  models.forEach((model) => {
    const filePath = path4.join(
      outputDir,
      model.name.toLowerCase(),
      `create-${model.name.toLowerCase()}.dto.ts`
    );
    fs3.mkdirSync(path4.dirname(filePath), { recursive: true });
    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true
    });
    const enumImports = /* @__PURE__ */ new Set();
    model.fields.forEach((f) => {
      if (f.type === "enum" && f.enumName) {
        enumImports.add(f.enumName);
      }
    });
    if (enumImports.size > 0) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `../enums`,
        namedImports: Array.from(enumImports)
      });
    }
    const validatorImports = /* @__PURE__ */ new Set([
      "IsString",
      "IsInt",
      "IsBoolean",
      "IsDate",
      "IsOptional",
      "IsEnum"
    ]);
    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: "@nestjs/swagger",
        namedImports: ["ApiProperty", "ApiPropertyOptional"]
      },
      {
        moduleSpecifier: "class-validator",
        namedImports: Array.from(validatorImports)
      }
    ]);
    sourceFile.addClass({
      name: `Create${model.name}Dto`,
      isExported: true,
      properties: model.fields.filter((f) => !f.isId && f.type !== "relation").map((field) => ({
        kind: StructureKind.Property,
        name: field.name,
        hasQuestionToken: !field.required,
        type: mapTsType(field.type),
        decorators: buildDecorators(field)
      }))
    });
  });
  project.saveSync();
}
var init_create_dto_generator = __esm({
  "src/generators/create-dto.generator.ts"() {
    "use strict";
    init_map_ts_type_util();
    init_build_decorator_util();
  }
});

// src/generators/update-dto.generator.ts
import { Project as Project3, QuoteKind as QuoteKind2 } from "ts-morph";
import path5 from "path";
import fs4 from "fs";
function generateUpdateDTO(models, outputDir) {
  const project = new Project3({
    manipulationSettings: {
      quoteKind: QuoteKind2.Double
    }
  });
  models.forEach((model) => {
    const folder = path5.join(outputDir, model.name.toLowerCase());
    const filePath = path5.join(
      folder,
      `update-${model.name.toLowerCase()}.dto.ts`
    );
    fs4.mkdirSync(folder, { recursive: true });
    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@nestjs/mapped-types",
      namedImports: ["PartialType"]
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./create-${model.name.toLowerCase()}.dto`,
      namedImports: [`Create${model.name}Dto`]
    });
    sourceFile.addClass({
      name: `Update${model.name}Dto`,
      isExported: true,
      extends: `PartialType(Create${model.name}Dto)`
    });
  });
  project.saveSync();
}
var init_update_dto_generator = __esm({
  "src/generators/update-dto.generator.ts"() {
    "use strict";
  }
});

// src/utils/build-swagger-decorator.util.ts
function buildSwaggerDecorator(field) {
  if (field.type === "enum") {
    return [
      {
        name: field.required ? "ApiProperty" : "ApiPropertyOptional",
        arguments: [`{ enum: ${field.enumName} }`]
      }
    ];
  }
  return [
    {
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: []
    }
  ];
}
var init_build_swagger_decorator_util = __esm({
  "src/utils/build-swagger-decorator.util.ts"() {
    "use strict";
  }
});

// src/generators/response-dto.generator.ts
import { Project as Project4, StructureKind as StructureKind2 } from "ts-morph";
import path6 from "path";
import fs5 from "fs";
function generateResponseDTO(models, outputDir) {
  const project = new Project4();
  models.forEach((model) => {
    const folder = path6.join(outputDir, model.name.toLowerCase());
    const filePath = path6.join(
      folder,
      `${model.name.toLowerCase()}.response.dto.ts`
    );
    fs5.mkdirSync(folder, { recursive: true });
    const sourceFile = project.createSourceFile(filePath, "", {
      overwrite: true
    });
    sourceFile.addImportDeclarations([
      {
        moduleSpecifier: "@nestjs/swagger",
        namedImports: ["ApiProperty", "ApiPropertyOptional"]
      },
      {
        moduleSpecifier: "class-transformer",
        namedImports: ["Expose"]
      }
    ]);
    const enumImports = /* @__PURE__ */ new Set();
    model.fields.forEach((f) => {
      if (f.type === "enum" && f.enumName) {
        enumImports.add(f.enumName);
      }
    });
    if (enumImports.size > 0) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: `../enums`,
        namedImports: Array.from(enumImports)
      });
    }
    sourceFile.addClass({
      name: `${model.name}ResponseDto`,
      isExported: true,
      decorators: [
        {
          name: "Exclude",
          arguments: []
        }
      ],
      properties: model.fields.filter((f) => f.type !== "relation").map((field) => ({
        kind: StructureKind2.Property,
        name: field.name,
        hasQuestionToken: !field.required,
        type: mapTsType(field),
        decorators: [
          {
            name: "Expose",
            arguments: []
          },
          ...buildSwaggerDecorator(field)
        ]
      }))
    });
  });
  project.saveSync();
}
var init_response_dto_generator = __esm({
  "src/generators/response-dto.generator.ts"() {
    "use strict";
    init_map_ts_type_util();
    init_build_swagger_decorator_util();
  }
});

// src/index.ts
import { Command } from "commander";
var require_index = __commonJS({
  "src/index.ts"() {
    init_dmmf_loader();
    init_metadata_builder();
    init_config_loader();
    init_enum_generator();
    init_create_dto_generator();
    init_update_dto_generator();
    init_response_dto_generator();
    var program = new Command();
    program.name("nestjs-prisma-gen").description("Generate DTOs from Prisma schema").version("0.1.0");
    program.command("generate").option("-o, --output <path>", "Output directory", "src/generated").option("-m, --models <models>", "Comma separated model names").option("-w, --watch", "Watch schema and regenerate").action(async (options) => {
      const run = async () => {
        const dmmf = await loadDMMF();
        const config = await loadConfig();
        const meta = buildMetadata(dmmf, config);
        let models = meta.models;
        if (options.models) {
          const selected = options.models.split(",").map((m) => m.trim());
          models = models.filter((m) => selected.includes(m.name));
        }
        console.log(
          `Generating DTOs for: ${models.map((m) => m.name).join(", ")}`
        );
        generateEnums(meta.enums, options.output);
        generateCreateDTO(models, options.output);
        generateUpdateDTO(models, options.output);
        generateResponseDTO(models, options.output);
        console.log("\u2705 Generation complete");
      };
      await run();
      if (options.watch) {
        console.log("\u{1F440} Watching for changes...");
        const chokidar = await import("./esm-ED4XJDZO.mjs");
        const watcher = chokidar.watch("prisma/schema.prisma", {
          ignoreInitial: true
        });
        watcher.on("change", async () => {
          console.log("\u{1F504} Schema changed. Regenerating...");
          await run();
        });
      }
    });
    program.parse();
  }
});
export default require_index();
