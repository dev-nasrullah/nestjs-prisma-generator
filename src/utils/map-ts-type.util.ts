export function mapTsType(field: any): string {
  if (field.type === "enum") {
    return field.enumName!;
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
