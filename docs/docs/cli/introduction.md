---
title: Introduction
---

<head>
  <title>Stencil-Cli Introduction</title>
</head>
<p>

# Introduction

Developing a CLI (Command Line Interface) tool can be a complex and rewarding task. Many custom schematics were created to assist in the cli file generation process. These schematics can significantly enhance the user experience by automating manual setup processes, allowing users to focus more on their project's logic and less on boilerplate code.

In this CLI tool, several new commands have been added to expedite the manual setup of a server environment. Let's delve deeper into each of these commands and understand how they can benefit users:

1. `service-prisma`: This command creates a new prisma.service.ts file and adds it as a provider to app.module.ts. Prisma is a powerful ORM (Object-Relational Mapping) tool for Node.js and TypeScript, widely used for database operations. By automating the creation of the service file and its integration into the app module, developers can quickly set up Prisma in their projects, saving time and reducing the risk of errors.

2. `prisma`: Adding a sample User model to the schema.prisma file can be a common task when setting up a Prisma project. This command simplifies the process by automatically inserting the necessary code for a basic User model, allowing developers to start working with Prisma's data modeling features right away.

3. `service-user`: Integrating user service-related imports into app.module.ts can be repetitive and error-prone. This command streamlines the process by automatically adding the required imports, making it easier for developers to include user services in their applications.

4. `fixtures`: Docker-related files and shell scripts needed to run the pre-commit file in Husky can be cumbersome to create manually. This command generates these files, making it easier for developers to set up Docker environments and implement pre-commit hooks for code quality assurance.

5. `husky`: Setting up the pre-commit file in the .husky folder is essential for implementing pre-commit hooks. This command automates the creation of this file, ensuring that developers can easily integrate Husky into their projects for automated code checks before committing changes.

6. `github`: Creating a new .github folder and subdirectories like ISSUE_TEMPLATE and Workflow manually can be time-consuming. This command simplifies this process, helping developers set up GitHub repository templates and workflows more efficiently.

7. `devcontainer`: The devcontainer.json file in the .devcontainer directory is crucial for configuring development containers, especially in a Docker environment. This command generates the devcontainer.json file, making it easier for developers to set up their development environment within a container.

Overall, these commands enhance the usability of your CLI tool by automating repetitive and error-prone tasks, enabling developers to set up their server environments quickly and efficiently. By leveraging these custom schematics, developers can focus more on writing code and less on manual setup, ultimately improving productivity and code quality which is the prime goal for this setup.

</p>
