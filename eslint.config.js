import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import {
  defineConfig,
} from 'eslint/config';

export default defineConfig([
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
  }),
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      js,
      '@stylistic': stylistic,
    },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/max-len': ['error', {
        code: 80,
      }],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/line-style': ['error', {
        singleLine: {
          maxItems: 2,
        },
        multiLine: {
          minItems: 1,
        },
      }],
      '@stylistic/object-curly-newline': ['error', {
        consistent: true,
      }],
      '@stylistic/object-property-newline': ['error', {
        allowAllPropertiesOnSameLine: false,
      }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
    },
  },
]);
