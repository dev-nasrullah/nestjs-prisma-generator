export function buildSwaggerDecorator(field: any) {
  if (field.type === "enum") {
    return [
      {
        name: field.required ? "ApiProperty" : "ApiPropertyOptional",
        arguments: [`{ enum: ${field.enumName} }`],
      },
    ];
  }

  return [
    {
      name: field.required ? "ApiProperty" : "ApiPropertyOptional",
      arguments: [],
    },
  ];
}
