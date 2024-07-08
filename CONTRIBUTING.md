# Contributing Guide
* [Ways to Contribute](#ways-to-contribute)
* [Find an Issue](#find-an-issue)
* [Pull Request Lifecycle](#pull-request-lifecycle)
* [Development Environment Setup](#development-environment-setup)


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
