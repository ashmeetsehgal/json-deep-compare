# Contributing to json-deep-compare

Thank you for your interest in contributing to json-deep-compare! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in the [Issues](https://github.com/ashmeetsehgal/json-deep-compare/issues)
- If not, create a new issue with a clear description, relevant information, and a code sample demonstrating the unexpected behavior

### Suggesting Features

- Check if the feature has already been suggested in the [Issues](https://github.com/ashmeetsehgal/json-deep-compare/issues)
- If not, create a new issue with a clear description of the feature and why it would be valuable

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Lint your code: `npm run lint`
6. Push your branch: `git push origin feature/your-feature-name`
7. Submit a Pull Request from your fork to this repository

### Development Process

1. Install dependencies: `npm install`
2. Make changes to the code in `/src` directory
3. Write tests in the `/test` directory
4. Run tests: `npm test`
5. Test both formats: `npm run test:formats` (requires building first)
6. Build the library: `npm run build`

## Pull Request Guidelines

- Update the README.md with details of changes to the interface, if applicable
- Update the documentation with any new options or features
- Increase version numbers following [SemVer](http://semver.org/)
- The PR should work for Node.js 14.x and above

## Code Style

- Follow the ESLint configuration already set up in the project
- Write JSDoc comments for all functions and classes
- Use descriptive variable names and follow existing naming conventions
- Keep functions focused and small

## Testing

- All new features must include tests
- All tests should pass: `npm test`
- Aim to maintain or increase code coverage

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).