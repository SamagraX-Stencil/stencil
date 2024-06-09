---
title: Setup
---

<head>
  <title>Stencil-Cli Setup</title>
</head>
<p>

# INSTALLATION

install the package

```
npm install -g @samagra-x/stencil-cli
```

## USAGE

The alias for the `nest-cli` has been changed to `stencil`. So, all the commands available with the `nest-cli` are available.

### Bootstrap a new project

```
stencil new app-name
```

#### Options available while bootstrapping a project

In addition to the standard options included, the extra options available are:

- `prisma` : This is a required option with yes/no as acceptable options. On checking this option, the cli does the following tasks-

  - installs the `prisma` module and `@prisma/client` library
  - runs the `npx prisma init` command to generate a standard `schema.prisma` file
  - Creates the `prisma.service.ts` file and imports `PrismaService` in the `app.module.ts`
  - Adds a sample `User` model to the `schema.prisma` file
  - Runs `npx prisma generate` command to generate the TypeScript types

- `user-service` : This is a required option with yes/no as acceptable options. On checking this option, the cli does the following tasks-
  - installs the `@techsavvyash/user-service` library
  - adds an import statement to `app.module.ts` file `import { user } from '@techsavvyash/user-service';`.
  - additionally, in the `app.module.ts` file, it adds an import of `user.UserModule` to the `imports` array

#### Additional tasks performed by the cli

If use dont have `dry-run` enabled, then the cli generates `Fixture` files

In this, the cli does the following:

- Runs the `npx husky install` command
- Generates the `pre-commit` file in `./husky` folder
- Genrates all the docker related files and the the `.sh` files required by husky
- Generates the `.github` folder with `ISSUE_TEMPLATE` and `workflows` sub-directories
- Generates the `.devcontainer` folder with `devcontainer.json` file

### Future Scope

- Integrate `nestjs-monitor` as an npm package
- Logging with `axiom` and `ELK-stack`

</p>
