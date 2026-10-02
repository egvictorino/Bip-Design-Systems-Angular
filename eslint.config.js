// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const storybook = require('eslint-plugin-storybook');
const playwright = require('eslint-plugin-playwright');

module.exports = tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'storybook-static/**',
      '.angular/**',
      'out-tsc/**',
      'playwright-report/**',
      'test-results/**',
      'e2e/consumer-app/**',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'bip', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        [
          { type: 'element', prefix: 'bip', style: 'kebab-case' },
          { type: 'attribute', prefix: 'bip', style: 'camelCase' },
        ],
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
  {
    files: ['**/*.stories.ts'],
    extends: [...storybook.configs['flat/recommended']],
  },
  {
    // visual/ (Playwright + Vitest conviven en el repo, pero no en la misma carpeta) y
    // e2e/ (fuera de todo tsconfig de la librería) quedan afuera de
    // angular.json#test.include a propósito — nunca deben correr bajo Vitest.
    files: ['visual/**/*.ts', 'e2e/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // `networkidle` es exactamente lo que se necesita antes de un toHaveScreenshot() de
      // una story completa de Storybook (fuentes, imágenes, cualquier fetch diferido) — a
      // diferencia de una aserción puntual sobre un elemento, donde el auto-wait de
      // Playwright basta y la regla tiene razón en desaconsejarlo.
      'playwright/no-networkidle': 'off',
    },
  }
);
