export function buildDecorators(field: any) {
  const decorators: any[] = [];

  // Swagger
  if (field.type === "enum") {
    decorators.push({
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: [`{ enum: ${field.enumName} }`],
    });
  } else {
    decorators.push({
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: [],
    });
  }

  // Validation
  if (field.type === "enum") {
    decorators.push({
      name: "IsEnum",
      arguments: [field.enumName],
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
