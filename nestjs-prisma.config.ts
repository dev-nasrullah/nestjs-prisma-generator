/// <reference path="./nestjs-prisma.config.d.ts" />

import { defineConfig } from "nestjs-prisma-generator/config";

export default defineConfig<NestjsPrismaSchema>({
  output: {
    base: "generated",
  },
  models: {
    User: {
      exclude: ["password"],
    },
  },
});
