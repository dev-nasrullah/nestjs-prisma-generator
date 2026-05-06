export interface FieldConfig {
  exclude?: boolean;
  rename?: string;

  // validation overrides
  min?: number;
  max?: number;
  example?: any;

  readOnly?: boolean;
  writeOnly?: boolean;
}

export interface RelationConfig {
  mode?: "id" | "object";
  depth?: number;
}

export interface ModelConfig<FieldName extends string = string> {
  exclude?: FieldName[];
  rename?: Partial<Record<FieldName, string>>;
  fields?: Partial<Record<FieldName, FieldConfig>>;
  relations?: RelationConfig;
}

export interface GeneratorConfig {
  schema?: string;
  output?:
    | string
    | {
        base?: string;
      };

  models?: Record<string, ModelConfig>;
}

export type PrismaSchemaShape = Record<string, string>;

export type SchemaAwareModelConfig<FieldName extends string> = Omit<
  ModelConfig<FieldName>,
  "exclude"
> & {
  exclude?: FieldName[];
};

export type GeneratorConfigForSchema<TSchema extends PrismaSchemaShape> = Omit<
  GeneratorConfig,
  "models"
> & {
  models?: Partial<{
    [ModelName in keyof TSchema]: SchemaAwareModelConfig<TSchema[ModelName] & string>;
  }>;
};
