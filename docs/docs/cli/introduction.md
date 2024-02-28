---
title: Introduction
---

<head>
  <title>Stencil-Cli Introduction</title>
</head>
<p>

# Introduction

While developing this cli, many custom schematics were created to assist the cli in file generation.

The following new commands are available to the user if they wish to expedite a manual setup of their server

1. `service-prisma` : Creates a new `prisma.service.ts` and adds it as a provider to `app.module.ts`
2. `prisma` : Adds a sample `User` model to the `schema.prisma` file
3. `service-user` : Adds the necessary imports for `@techsavvyash/user-service` in `app.module.ts`
4. `fixtures` : Generate the docker related files along with the shell sciripts needed to run the `pre-commit` file in husky
5. `husky` : Creates the `pre-commit` file in the `.husky` folder
6. `github` : Creates a new `.github` folder and the `ISSUE_TEMPLATE` and `Workflow` subdirectory in it.
7. `devcontainer` : Generates the `devcontainer.json` in the .devcontainer directory.

</p>
