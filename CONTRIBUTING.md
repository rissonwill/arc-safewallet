# Contributing to Arc SafeWallet

Thank you for your interest in contributing to Arc SafeWallet! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include steps to reproduce
4. Provide environment details (OS, Node version, browser)

### Suggesting Features

1. Open an issue with the feature request template
2. Describe the use case and expected behavior
3. Explain why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Follow the coding standards below
4. Write tests for new functionality
5. Update documentation as needed
6. Submit a pull request

## Development Setup

```bash
git clone https://github.com/rissonwill/arc-safewallet.git
cd arc-safewallet
pnpm install
pnpm dev
```

## Coding Standards

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable and function names

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Aim for meaningful test coverage

```bash
pnpm test
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

## Review Process

1. All PRs require at least one review
2. Address review comments promptly
3. Keep PRs focused and reasonably sized
4. Squash commits before merging

## Questions?

Open an issue or reach out on [Twitter](https://twitter.com/smartcript).

Thank you for contributing!
