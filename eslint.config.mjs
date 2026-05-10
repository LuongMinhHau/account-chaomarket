import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Enterprise: use Pino logger instead of console.*
      'no-console': ['warn', { allow: ['error'] }],
      // Enterprise: minimize `any` usage
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow underscore-prefixed unused vars (destructured but intentionally unused)
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
      // Allow empty interfaces extending others (common in component patterns)
      '@typescript-eslint/no-empty-object-type': 'off',
      // Allow @ts-nocheck in generated/third-party files
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-nocheck': 'allow-with-description',
        'ts-ignore': true,
      }],
    },
  },
  // React Compiler strictness — relax rules that flag safe, common patterns
  {
    rules: {
      // setMounted(true) in useEffect is standard React hydration pattern
      'react-hooks/set-state-in-effect': 'off',
      // next-themes, useSearchParams etc return functions React Compiler can't analyze
      'react-hooks/incompatible-library': 'off',
      // Math.random / Date.now in render — used for IDs/timestamps, not visual output
      'react-hooks/purity': 'off',
      // Ref access during render — common in Radix UI + tiptap primitives
      'react-hooks/refs': 'off',
      // Manual memoization — sometimes intentional for performance control
      'react-hooks/preserve-manual-memoization': 'off',
      // Immutability violations — overly strict for complex state patterns
      'react-hooks/immutability': 'off',
    },
  },
  // Third-party: tiptap UI primitives — not our code, suppress all
  {
    files: [
      'src/components/tiptap-ui-primitive/**',
      'src/components/tiptap-ui/**',
      'src/components/tiptap-templates/**',
    ],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
