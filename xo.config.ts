import type {FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
  {
    space: true,
    semicolon: true,
    react: true,
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'unicorn/empty-brace-spaces': 'off',
      'import-x/extensions': 'off',
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
          format: ['camelCase', 'UPPER_CASE'],
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
          selector: 'property',
          format: ['camelCase', 'snake_case', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'method',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'UPPER_CASE'],
        },
      ],
      'react/jsx-tag-spacing': 'off',
      'new-cap': 'off',
      'react/new-cap': 'off',
      // React 17+ JSX transform: no need to import React for JSX
      'react/react-in-jsx-scope': 'off',
      // Defer JSX indentation to @stylistic/indent to avoid conflicts
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/jsx-closing-tag-location': 'off',
    },
  },
];

export default xoConfig;
