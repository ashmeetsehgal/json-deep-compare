module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-useless-escape': 'error'
  },
  overrides: [
    {
      files: ['examples/esm-import-example.js'],
      parserOptions: {
        sourceType: 'module'
      }
    }
  ]
};