# Publishing `json-deep-compare` to npm

This document explains how the `json-deep-compare` package is published to the npm registry.

## Available Registry

`json-deep-compare` is available from the npm registry:

- **npm Registry**: [https://www.npmjs.com/package/json-deep-compare](https://www.npmjs.com/package/json-deep-compare)

## Installation Instructions

### Installing from npm Registry

```bash
npm install json-deep-compare
```

or

```bash
yarn add json-deep-compare
```

### Using in Your Project

Once installed, you can import and use the package:

```javascript
// CommonJS
const { compareJSON } = require('json-deep-compare');

// ES Modules
import { compareJSON } from 'json-deep-compare';
```

## Publishing Process

The package is automatically published to npm when:

1. A new release is created on GitHub, or
2. The version in `package.json` is updated on the main branch

The publishing process is handled by GitHub Actions workflow defined in `.github/workflows/publish-package.yml`.