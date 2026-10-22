import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig(
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    // languageOptions: how ESLint should read the code in the files it matches
    languageOptions: {
      // parserOptions: these are settings passed to the parser
      parserOptions: {
        // projectService: tells the parser how to find the TypeScript project (the tsconfig.json) that a file belongs to
        projectService: {
          // allowDefaultProject: list of files to be linted anyway if no tsconfig is found (use default configs)
          allowDefaultProject: ['commitlint.config.js'],
        },
        // tsconfigRootDir: the folder where the parser starts looking for tsconfig.json
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  prettier,
  {
    rules: {
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
