export type ScalarType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "relation";

export interface FieldMeta {
  name: string;
  type: ScalarType;
  required: boolean;
  isArray: boolean;

  isId: boolean;
  isUnique: boolean;

  relation?: {
    model: string;
  };

  enumName?: string;

  config?: {
    exclude?: boolean;
    rename?: string;
    min?: number;
    max?: number;
    example?: any;
    readOnly?: boolean;
    writeOnly?: boolean;
  };
}

export interface ModelMeta {
  name: string;
  fields: FieldMeta[];
}

export interface EnumMeta {
  name: string;
  values: string[];
}

export interface ModelMeta {
  name: string;
  fields: FieldMeta[];
}

export interface FullMetadata {
  models: ModelMeta[];
  enums: EnumMeta[];
}
