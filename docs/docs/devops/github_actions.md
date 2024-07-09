---
title: Github Actions
---
import DocsCard from '@components/global/DocsCard';
import DocsCards from '@components/global/DocsCards';

<head>
  <title>Stencil Devops</title>
</head>
<p>

Stencil comes with pre-configured GitHub Actions workflows to automate essential development tasks. Below are explanations of the provided workflows:

## 1. Checking Test Coverage on PRs

This workflow is triggered on pull requests to the target branch. It leverages the Jest Coverage Report Action to assess the test coverage of the Stencil project. The workflow checks out the code and runs the Jest coverage report to ensure comprehensive test coverage on pull requests.

---

## 2. Publishing the Package to NPM

This workflow is triggered on pushes to the "main" branch and pull requests. It runs on the latest Ubuntu environment and performs the following steps:

1. Checks out the code.
2. Sets up Node.js version 16.18.
3. Installs npm dependencies.
4. Publishes the package to NPM using the provided NPM authentication token.

This workflow automates the process of releasing new versions of the Stencil package to NPM, ensuring a streamlined and consistent release process.

---

## 3. Docker E2E Tests

This workflow runs on pushes to the "main" branch and pull requests targeting the "main" branch. It executes on the latest Ubuntu environment and performs the following steps:

1. Checks out the code.
2. Runs end-to-end (e2e) tests using Docker Compose with the specified configuration and environment files.

This workflow facilitates the execution of end-to-end tests within a Dockerized environment, ensuring a reliable testing process for the Stencil project.

---

These GitHub Actions workflows automate critical aspects of the Stencil project's development and testing lifecycle, contributing to a more efficient and reliable development process.


</p>
