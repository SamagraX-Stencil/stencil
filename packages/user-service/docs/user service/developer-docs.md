## Developers

Thank you for investing your time in contributing to our project! Any contribution you make will be of utmost importance to the Community ✨.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR. This project aims to simplify and guide the way beginners make their first contribution. If you are looking to make your first contribution, follow the steps below.

### 📄 Contribution Guidelines

If you are a new developer looking to contribute something to User service, please take a look and see if there's anything that you'd like to work on in the [issue tracker](https://github.com/Samarth-HP/esamwad-user-service/issues).

The "Good First Issue" label has been added to any tasks that seem like a good way to get started working with the codebase.

Please let us know that you're working on an open issue and let us assign it to you, this ensures that two people aren't working on the same issue, and ensures that all effort is valuable to the project. If an issue hasn't seen activity in a couple of weeks, feel free to ping the assignee to see if they're working on it, or ask a maintainer to reassign the issue to you.

If you can't work on an issue any more, please post another message to let us know.

If it's unclear exactly what needs to be done, or how to do it, please don't hesitate to ask for clarification or help!

Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

### 💻 Development Environment Setup

1. Fork the user service repository.

2. Now let's set up our local repository

```shell
git clone https://github.com/username/esamwad-user-service.git
```
3. Next step is to establish an upstream connection with the base repository

```shell
cd esamwad-user-service
```

```shell
git remote add upstream https://github.com/Samarth-HP/esamwad-user-service.git
```

### 🥇 Your First Pull Request

Now if want to make a new change to the code base, we create a new 'feature branch' based off the latest version of the main branch:

```shell
git checkout master
```

All the changes must be made on a different branch, not on the master.

```shell
git checkout -b my-feature-branch 
# make changes here
git push origin HEAD
```
### 🆘 Dealing with Merge Conflicts

If changes are made to the User service repository that conflict with the changes in your pull request in-between creating the feature branch and your changes getting merged into the master repository, it may be necessary to rebase your code:

```shell
git checkout master
git pull upstream master
git checkout my-feature-branch # or just "git checkout -" 
git rebase master
# it may be necessary to resolve merge conflicts here
# if you need to update the existing pull request, you should do a 'force' push
git push origin HEAD -f
```

### 👨‍💻 Community 

If you have any queries or want to share any suggestions regarding User service you can create a issue in the [Issue tracker](https://github.com/Samarth-HP/esamwad-user-service/issues) and tag the Maintainers about your query/feedback. You don't need to have a solution to the problem you are facing to kick off a discussion. We are hoping to foster productive and collaborative conversations!

Maintainers:

- Chakshu Gautam - chakshu@samagragovernance.in 
- Radhay Anand - radhay@samagragovernance.in