# Contributing Guide
- [Contributing Guide](#contributing-guide)
	- [Repository Structure](#repository-structure)
	- [Development Setup](#development-setup)
	- [Development workflow](#development-workflow)
		- [For features/bug fixing](#for-featuresbug-fixing)
		- [Writing and running tests](#writing-and-running-tests)
		- [Pre-commit checklist](#pre-commit-checklist)
	- [Ways to Contribute](#ways-to-contribute)
	- [Community Issue Assignment Policy](#community-issue-assignment-policy)
	- [Guidelines](#guidelines)
	- [Resources](#resources)


## Repository Structure
```
.
├── docker-compose/
├── docs/
├── packages/
├── sample/
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── package-lock.json
├── package.json
└── yarn.lock
```
- `packages` directory is where the main code resides, it is where all the custom components published and provided by `@samagra-x/stencil` package can be found. All the featuers that you code will be implemented here.
-  `sample` directory contains reference applications showcasing individual functionalities and how they can setup or migrated in your nest application via stencil.
- `docker-compose` directory contains the commonly used docker-compose setups which we find handy.
- `docs` this folder contains the documentation for the framework. This is a docusaurus app which can be started for easy reference.


## Development Setup 

To set up Stencil in your local development environment; follow the steps listed below

1. Fork the stencil repo 
2. Clone your fork into any folder of your choice via `git clone https://github.com/<USERNAME>/stencil.git`
3. The `packages/common` folder corresponds to the npm package `@samagra-x/stencil`
4. Any features additoins or bug fixes are to be done here
5. Corresponding to every functionality in the `common` folder you can find an example application in the `sample` folder
6. Here's where you can realise changes made to the package and test your changes

## Development workflow

Once the repository is setup your workflow will look like the following.

### For features/bug fixing
1. Initially make changes to `packages/common/src`
2. Once changes have been made to the `src` folder you are supposed to build the package via `npm run build`. This is to be done inside the `packages/common` directory
3. Once changes are made run `npm link` in the `packages/common` directory (this creates a [symlink](https://docs.npmjs.com/cli/v9/commands/npm-link) of your modified package in the node globals and the published package is overriden) 
4. Then navigate to the example app in `sample` which corresponds to the changes you have made run `npm install` to set up the dependencies. After setting up the dependencies run `npm link @samagra-x/stencil` (this lets the project know you want to use the modified package and not the published package)
5. Once the feature runs as expected continue to writing tests

### Writing and running tests

1. To write tests find the `/test` 
2. In the `packages/common` you will find two kinds of tests
3. One is a `service-spec` test, where the service layer tests are defined
4. The other is an `app.e2e` test, here the application controllers are tested
5. To run the `service-spec` tests run `npm run test` and to run the `app.e2e` tests run `npm run test:e2e`
6. For every new feature or bug fix you are supposed to either write new tests or modify current test suites

### Pre-commit checklist

Before commiting and submitting pull request follow the given steps

1. Lint your code with `prettier` before your commit via `npm run lint`
2. Make sure all test suites are passing before you make your commit/pull request
3. Use `npm run test` and `npm run test:e2e` and make sure all tests are passing before making your commit 

## Ways to Contribute

- As a first time contributor, navigating through the project, it can be quite daunting for you. Please make sure to go through the [repository structure](#repository-structure) to understand the project a bit better, if you want to understand the project better.

- Open a issue ticket for any gap in documentation or bug or feature requests that you have, opening up issue tickets is always a good way to contribute.

- You can help review open PRs for best backend and devops realted code practices and help the contributors out.

- Lastly and the most obvious one feel free to pick up open issue tickets and raise a PR for it resolving the bug, feature or documentation request.

## Community Issue Assignment Policy

Ideally all the tickets are open for the open source and C4GT Community to contribute to, but the assignment of a issue comes only after the contributor has raised a draft PR implementing the partial functionality required by the issue ticket.

## Guidelines

- Please don't spam the comments on an issue tickets with assignment requests, keep the comment sections clean and only ask questions/clarifications regarding the issue ticket, the assignment policy has been clearly stated in the [community-issue-assignment-policy](#community-issue-assignment-policy) section.

- Make sure to populate all the relevant and required fields of the PR template while raising the PR.


## Resources 

In case you're unfamiliar with the technology being used for the project and how to understand the project better this section will act as a repository to provide some base material around them to help you get started 

* [Prometheus](https://youtube.com/playlist?list=PLy7NrYWoggjxCF3av5JKwyG7FFF9eLeL4&si=3st6TLqgku1xrP_p)
* [Monitor on Ubuntu Server](https://www.youtube.com/watch?v=94JMdueq2SA)
* [Monitor on Windows](https://www.youtube.com/watch?v=jatcPHvChfI&t=763s)
* [Prometheus and Grafana Tutorial](https://www.youtube.com/watch?v=9TJx7QTrTyo&t=2s)
* [More about Prometheus](https://prometheus.io/docs/prometheus/latest/getting_started/)
* [More about Grafana](https://grafana.com/docs/grafana/latest/)
