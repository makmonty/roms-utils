import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      js,
      '@stylistic': stylistic
    },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always']
    }
  }
]);
