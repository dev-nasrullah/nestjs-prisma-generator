/// <reference path="./nestjs-prisma.config.d.ts" />

import { defineConfig } from "nestjs-prisma-generator/config";

const config = {
  schema: "prisma/schema.prisma",
  output: "generated",
  models: {
    User: {
      exclude: ["password"],
    },
  },
} satisfies NestjsPrismaConfig;

export default defineConfig(config);
