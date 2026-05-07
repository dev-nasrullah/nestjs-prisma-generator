import type { GeneratorConfigForSchema } from "@nasrullah02/nestjs-prisma-generator/config";

declare global {
  type NestjsPrismaSchema = {
  Post: "id" | "title" | "description" | "user" | "userId";
  User: "id" | "email" | "password" | "role" | "posts";
};
  type NestjsPrismaConfig = GeneratorConfigForSchema<NestjsPrismaSchema>;
}

export {};
