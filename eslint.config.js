import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      js,
      '@stylistic': stylistic,
    },
    extends: ['js/recommended', tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
        },
      ],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: false,
        },
      ],
      '@stylistic/object-curly-spacing': ['error', 'always'],
    },
  },
  prettierRecommended,
]);
