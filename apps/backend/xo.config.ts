import type {FlatXoConfig} from 'xo';

const backendConfig: FlatXoConfig = [
  {
    ignores: [
      '.next/**',
      'next-env.d.ts',
      'out/**',
      'node_modules/**',
      'coverage/**',
      '**/*.test.ts', // Tests have different rules (handled in vitest)
      'tests/**/*',
    ],
  },
  {
    space: true,
    semicolon: true,
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      'unicorn/empty-brace-spaces': 'off',
      'react/require-default-props': 'off',

      // --- Relax rules that do not match project conventions / modern standards ---
      'react/prop-types': 'off',
      'require-unicode-regexp': 'off',
      '@typescript-eslint/class-literal-property-style': 'off',

      // --- Import resolution: bundler resolves extensions itself ---
      'import-x/extensions': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'n/file-extension-in-import': 'off',
      'n/no-extraneous-import': 'off',

      // --- Relax strict unsafe TS checks (handled by tsc) ---
      complexity: 'off',
      'import-x/order': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // --- Standard TypeScript conventions ---
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'n/prefer-global/process': 'off',

      '@stylistic/max-len': [
        'error',
        {
          code: 100,
          ignorePattern: String.raw`^import\s`,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      '@stylistic/curly-newline': 'off',
      '@stylistic/object-curly-newline': 'off',
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/jsx-quotes': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/indent-binary-ops': 'off',

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'property',
          format: ['camelCase', 'snake_case', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'property',
          modifiers: ['requiresQuotes'],
          format: null,
        },
        {
          selector: 'method',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'method',
          filter: {
            regex: '^(toJSON|toString|valueOf|Symbol)$',
            match: true,
          },
          format: null,
        },
        {
          selector: 'method',
          filter: {
            regex: '^(from|to)ISOString$',
            match: true,
          },
          format: null,
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
      ],

      'react/jsx-tag-spacing': 'off',
      'new-cap': 'off',
      'react/new-cap': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/jsx-closing-tag-location': 'off',
    },
  },
  {
    files: ['tests/**/*'],
    rules: {
      'import-x/no-unassigned-import': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
];

export default backendConfig;
