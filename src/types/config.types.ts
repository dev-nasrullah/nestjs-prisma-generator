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

export interface ModelConfig {
  exclude?: string[];
  rename?: Record<string, string>;
  fields?: Record<string, FieldConfig>;
  relations?: RelationConfig;
}

export interface GeneratorConfig {
  output?: {
    base?: string;
  };

  models?: Record<string, ModelConfig>;
}
