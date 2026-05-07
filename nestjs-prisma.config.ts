/// <reference path="./nestjs-prisma.config.d.ts" />

import { defineConfig } from "@nasrullah02/nestjs-prisma-generator/config";

const config = {
  schema: "prisma/schema.prisma", // Path to folder or file with Prisma schema(s)
  output: "generated",
} satisfies NestjsPrismaConfig;

export default defineConfig(config);
