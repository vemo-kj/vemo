import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    parser: '@typescript-eslint/parser', // TypeScript 파서를 설정
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      tsconfigRootDir: __dirname,
      project: ['./tsconfig.json'], // tsconfig.json 파일 참조
    },
    plugins: ['@typescript-eslint'], // @typescript-eslint 플러그인 추가
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended', // TypeScript 권장 규칙
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'prettier',
      'next/core-web-vitals',
    ],
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
];

export default eslintConfig;