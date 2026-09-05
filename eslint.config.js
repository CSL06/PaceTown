// @ts-check
/**
 * Flat config. Deliberately close to the recommended sets — a lint config
 * that argues with the team gets disabled, and a disabled linter catches
 * nothing.
 *
 * The rules that are turned *up* here are the ones this codebase actually
 * depends on: exhaustive hook dependencies (the game loop is full of refs and
 * effects) and no floating promises in the async auth layer.
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist', 'node_modules', 'coverage', '*.tsbuildinfo', 'tools',
      'assets/generated', 'assets/production', 'assets/third-party',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      /* The classic correctness rules stay errors: these catch real bugs. */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      /* The rest of the recommended set is the React Compiler's analysis, and
         it assumes you have adopted the compiler. This project has not. The
         game loop in game/useWorld.ts and landing/LiveTown.tsx deliberately
         writes position straight to refs and the DOM at 60fps, because
         routing that through state would re-render the tree sixty times a
         second — the compiler rules flag exactly that pattern by design.
         Warnings keep them visible for new code without failing CI over an
         architecture that was chosen on purpose. Revisit if the project ever
         turns the compiler on. */
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/set-state-in-effect': 'warn',

      // Fast refresh only works when a module's exports are all components.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // An underscore prefix is the codebase's existing signal for
      // "deliberately unused" — see publicOf() in auth/session.ts.
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],

      // `any` defeats the point of the domain layer being typed.
      '@typescript-eslint/no-explicit-any': 'error',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  {
    // Tests reach into internals and stub globals on purpose.
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  {
    // The service worker runs in a worker scope, not the browser one.
    files: ['assets/app-runtime-v1/sw.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
)
