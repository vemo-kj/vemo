import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'max-len': [
        'warn',
        { code: 100, ignoreStrings: true, ignoreComments: true },
      ],
    },
    settings: {
      next: {
        rootDir: __dirname,
      },
    },
  },
  ...compat.config({
    extends: ['prettier'],
  }),
];

export default eslintConfig;
