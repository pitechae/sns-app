# SNS ERP Git Workflow

This document outlines the Git workflow for the SNS ERP project, following enterprise best practices for version control.

## Branch Strategy

We follow a trunk-based development approach with feature branches:

- `main` - The primary branch containing production-ready code
- `develop` - Integration branch for features before they go to production
- Feature branches - Short-lived branches for individual features or fixes

### Branch Naming Convention

All branches should follow this naming convention:

- `feature/[ticket-number]-short-description` - For new features
- `fix/[ticket-number]-short-description` - For bug fixes
- `refactor/[ticket-number]-short-description` - For code refactoring
- `docs/[ticket-number]-short-description` - For documentation updates
- `chore/[ticket-number]-short-description` - For maintenance tasks

Example: `feature/SNS-123-implement-user-authentication`

## Commit Standards

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for all commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Scope

The scope should be the name of the component or module affected by the change.

Examples:
- `feat(auth): implement login functionality`
- `fix(dashboard): resolve data loading issue`
- `refactor(sidebar): improve component structure`

## Workflow Process

### Starting a New Feature

1. Create a new branch from `develop`:
   ```
   git checkout develop
   git pull
   git checkout -b feature/SNS-123-feature-name
   ```

2. Make changes and commit regularly with descriptive messages:
   ```
   git add .
   git commit
   ```

3. Push your branch to the remote repository:
   ```
   git push -u origin feature/SNS-123-feature-name
   ```

### Code Review Process

1. Create a Pull Request (PR) to merge your feature branch into `develop`
2. Assign reviewers and link the PR to any relevant tickets
3. Address review comments with additional commits
4. Once approved, merge the PR using the "Squash and merge" option

### Releasing to Production

1. Create a release branch from `develop`:
   ```
   git checkout develop
   git checkout -b release/v1.0.0
   ```

2. Make any final adjustments and version updates
3. Create a PR to merge the release branch into `main`
4. After merging to `main`, tag the release:
   ```
   git checkout main
   git pull
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

5. Merge `main` back into `develop` to sync any release fixes

## Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, descriptive commit messages
- Pull and rebase frequently to avoid merge conflicts
- Never force push to shared branches (`main`, `develop`)
- Delete feature branches after they are merged

## Git Hooks

We use Git hooks to enforce code quality standards:

- Pre-commit: Runs linters and formatters
- Pre-push: Runs tests to prevent pushing failing code

## Continuous Integration

All branches and PRs are automatically built and tested by our CI system. PRs cannot be merged if the build fails or tests don't pass.
