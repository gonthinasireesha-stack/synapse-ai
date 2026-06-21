// eslint.config.js
// Modern "flat config" format (ESLint 9+ style).
// Configured for Node.js + ES Modules (not browser, not CommonJS).

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      eqeqeq: ['error', 'always'], // require === instead of == (avoids type coercion bugs)
      'no-console': 'off',          // we use console.log intentionally for server logs
    },
  },
];