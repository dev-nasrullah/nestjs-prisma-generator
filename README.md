# nestjs-prisma-generator

Generate NestJS DTOs and Swagger metadata from a Prisma schema.

This package reads your Prisma schema and generates:

- `Create*Dto`
- `Update*Dto`
- `*ResponseDto`
- enum exports

It supports:

- single-file Prisma schemas
- multi-file Prisma schemas and schema folders
- nested relation DTOs
- cycle-safe relation generation
- typed `nestjs-prisma.config.ts`

## Install

```bash
npm install nestjs-prisma-generator
```

You also need a Prisma schema in your project.

## CLI

```bash
npx nestjs-prisma-gen generate
```

Options:

- `-s, --schema <path>`: Prisma schema file or schema folder
- `-o, --output <path>`: output directory
- `-m, --models <models>`: comma-separated model names
- `-w, --watch`: watch schema files and regenerate on change

## Defaults

If you do not provide CLI flags, the generator uses:

- schema: `prisma/schema.prisma`
- output: `generated`

You can override both in `nestjs-prisma.config.ts`.

## Quick Start

Create a config file in your project root:

```ts
/// <reference path="./nestjs-prisma.config.d.ts" />

import { defineConfig } from "nestjs-prisma-generator/config";

const config = {
  schema: "prisma/schema.prisma",
  output: "generated",
  models: {
    User: {
      exclude: ["password"],
      relations: {
        mode: "object",
        depth: 1,
      },
    },
  },
} satisfies NestjsPrismaConfig;

export default defineConfig(config);
```

Then run:

```bash
npx nestjs-prisma-gen generate
```

## Typed Config

On each generation run, the package creates:

```txt
nestjs-prisma.config.d.ts
```

This file is derived from your Prisma schema and gives type safety for:

- model names
- field names
- `exclude`
- `rename`
- `fields`

Example:

```ts
models: {
  User: {
    exclude: ["password"],
    fields: {
      email: {
        example: "user@example.com",
      },
    },
  },
}
```

If you use a wrong model or field name, TypeScript will report it.

## Multi-file Prisma Schema Support

Modern Prisma supports splitting schema into multiple files. This package supports both:

### Single file

```ts
schema: "prisma/schema.prisma"
```

### Schema folder

```ts
schema: "prisma"
```

Or:

```bash
npx nestjs-prisma-gen generate --schema prisma
```

When using `--watch`, the generator watches all `.prisma` files inside the resolved schema root.

## Generated Output

For a schema like:

```prisma
model User {
  id    String @id
  email String
  posts Post[]
}

model Post {
  id     String @id
  title  String
  user   User   @relation(fields: [userId], references: [id])
  userId String
}
```

The generator creates files like:

```txt
generated/
  enums.ts
  user/
    create-user.dto.ts
    update-user.dto.ts
    user.response.dto.ts
  post/
    create-post.dto.ts
    update-post.dto.ts
    post.response.dto.ts
```

## Relations

Relations can be generated as nested DTOs.

Example:

```ts
models: {
  User: {
    relations: {
      mode: "object",
      depth: 1,
    },
  },
}
```

Relation options:

- `mode: "object"`: include nested relation DTOs
- `mode: "id"`: skip nested relation DTO generation
- `depth`: maximum relation nesting depth

## Circular Dependency Safety

Bidirectional relations like `User.posts -> Post.user` are generated using depth-limited relation DTO variants.

This prevents:

- infinite nesting
- circular eager imports at runtime
- broken Swagger relation metadata for nested DTOs

## Config Reference

```ts
import { defineConfig } from "nestjs-prisma-generator/config";

const config = {
  schema: "prisma/schema.prisma",
  output: "generated",
  models: {
    User: {
      exclude: ["password"],
      rename: {
        email: "userEmail",
      },
      fields: {
        email: {
          example: "user@example.com",
          readOnly: false,
          writeOnly: false,
        },
      },
      relations: {
        mode: "object",
        depth: 1,
      },
    },
  },
} satisfies NestjsPrismaConfig;

export default defineConfig(config);
```

## CLI Precedence

CLI flags override config values.

Order of precedence:

1. CLI `--schema` / `--output`
2. `nestjs-prisma.config.ts`
3. package defaults

## Notes

- `Update*Dto` is generated from `PartialType(Create*Dto)`.
- The generator reads Prisma schema metadata through Prisma internals.
- For Prisma 7+, your schema must be valid for your installed Prisma version.

## License

MIT
