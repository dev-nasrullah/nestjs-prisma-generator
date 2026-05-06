import type { GeneratorConfigForSchema } from "nestjs-prisma-generator/config";

declare global {
  type NestjsPrismaSchema = {
  User: "id" | "email" | "password" | "role" | "posts";
  Post: "id" | "title" | "description" | "user" | "userId";
};
  type NestjsPrismaConfig = GeneratorConfigForSchema<NestjsPrismaSchema>;
}

export {};
