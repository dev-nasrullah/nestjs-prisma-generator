import {
  GeneratorConfig,
  GeneratorConfigForSchema,
  PrismaSchemaShape,
} from "./types/config.types";

export type {
  FieldConfig,
  GeneratorConfig,
  GeneratorConfigForSchema,
  ModelConfig,
  PrismaSchemaShape,
  RelationConfig,
  SchemaAwareModelConfig,
} from "./types/config.types";

export function defineConfig<TSchema extends PrismaSchemaShape>(
  config: GeneratorConfigForSchema<TSchema>,
): GeneratorConfigForSchema<TSchema>;
export function defineConfig(config: GeneratorConfig): GeneratorConfig;
export function defineConfig(
  config: GeneratorConfig | GeneratorConfigForSchema<PrismaSchemaShape>,
) {
  return config;
}
