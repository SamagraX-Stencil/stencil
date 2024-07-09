---
title: Introduction
---

<head>
  <title>Stencil-Cli Introduction</title>
</head>
<p>

# Introduction

While developing this cli, many custom schematics were created to assist the cli in file generation.

In this CLI tool, several new commands have been added to expedite the manual setup of a server environment. Let's delve deeper into each of these commands and understand how they can benefit users:

1. `service-prisma` : Creates a new `prisma.service.ts` and adds it as a provider to `app.module.ts`
2. `prisma` : Adds a sample `User` model to the `schema.prisma` file
3. `service-user` : Adds the necessary imports for `@samagra-x/user-service` in `app.module.ts`
4. `fixtures` : Generate the docker related files along with the shell sciripts needed to run the `pre-commit` file in husky
5. `husky` : Creates the `pre-commit` file in the `.husky` folder
6. `github` : Creates a new `.github` folder and the `ISSUE_TEMPLATE` and `Workflow` subdirectory in it.
7. `devcontainer` : Generates the `devcontainer.json` in the .devcontainer directory.

Overall, these commands enhance the usability of your CLI tool by automating repetitive and error-prone tasks, enabling developers to set up their server environments quickly and efficiently. By leveraging these custom schematics, developers can focus more on writing code and less on manual setup, ultimately improving productivity and code quality which is the prime goal for this setup.

</p>
