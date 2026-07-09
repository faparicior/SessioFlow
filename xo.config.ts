import type {FlatXoConfig} from 'xo';
// Optional: Next.js-specific lint rules (no-img-element, no-html-link-for-pages, etc.)
// npm install --save-dev @next/eslint-plugin-next
// import nextPlugin from '@next/eslint-plugin-next';

const xoConfig: FlatXoConfig = [
  {
    space: true,
    semicolon: true,
    react: true,
    ignores: [
      '.next/**',
      'next-env.d.ts',
      'out/**',
      'node_modules/**',
      'coverage/**',
    ],
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

      // --- Import resolution: Next.js bundler resolves extensions itself ---
      'import-x/extensions': 'off',
      'n/file-extension-in-import': 'off',

      // --- Next.js conventionally uses anonymous default exports
      // (next.config.js, middleware.ts, API route handlers) ---
      'import/no-anonymous-default-export': 'off',

      // --- React idioms that unicorn/no-null and prevent-abbreviations
      // would otherwise fight ---
      // React idiomatically returns `null` to render nothing; `undefined`
      // is not the ecosystem convention here.
      'unicorn/no-null': 'off',
      // Next.js/React conventions are full of short, standard names
      // (req, res, params, props, ref, e) that this rule would flag.
      'unicorn/prevent-abbreviations': 'off',

      // --- Next.js special filenames (_app, _document, [id], [...slug],
      // page.tsx, layout.tsx, route.ts) don't fit typical filename-case
      // conventions — turn off rather than fight the framework ---
      'unicorn/filename-case': 'off',

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
          // Allow any casing/naming format for third-party or component imports
          selector: 'import',
          format: null,
        },
        {
          // CamelCase: normal variables
          // UPPER_CASE: true constants (e.g. MAX_RETRIES, API_BASE_URL)
          // PascalCase: arrow-function React components (const Button = () => ...)
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
          // Allows enums like:
          // enum Status { DRAFT = 'DRAFT', PUBLISHED = 'PUBLISHED' }
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
          // Well-known JS spec methods — casing is mandatory, not a style
          // choice (e.g. JSON.stringify calls toJSON specifically).
          selector: 'method',
          filter: {
            regex: '^(toJSON|toString|valueOf|Symbol)$',
            match: true,
          },
          format: null,
        },
        {
          // Domain convention: keep "ISO" recognizable in date helpers
          // rather than forcing fromIsoString/toIsoString.
          selector: 'method',
          filter: {
            regex: '^(from|to)ISOString$',
            match: true,
          },
          format: null,
        },
        {
          // CamelCase: normal functions
          // PascalCase: function-declaration React components (function Button() {...})
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
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
  {
    // Next.js App Router: route.ts handlers must be named exactly
    // GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS — allow UPPER_CASE
    // function names only in these files. Rule config replaces (not merges)
    // per matching file in ESLint flat config, so the full selector set
    // must be repeated here, not just the changed `function` selector.
    files: ['**/route.ts'],
    rules: {
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
          // Allows enums like:
          // enum Status { DRAFT = 'DRAFT', PUBLISHED = 'PUBLISHED' }
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
          // Well-known JS spec methods — casing is mandatory, not a style
          // choice (e.g. JSON.stringify calls toJSON specifically).
          selector: 'method',
          filter: {
            regex: '^(toJSON|toString|valueOf|Symbol)$',
            match: true,
          },
          format: null,
        },
        {
          // Domain convention: keep "ISO" recognizable in date helpers
          // rather than forcing fromIsoString/toIsoString.
          selector: 'method',
          filter: {
            regex: '^(from|to)ISOString$',
            match: true,
          },
          format: null,
        },
        {
          // UPPER_CASE added here for GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS
          selector: 'function',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
      ],
    },
  },
  {
    // Next.js App Router: layout.tsx, page.tsx, loading.tsx, error.tsx,
    // not-found.tsx, template.tsx, default.tsx, route.ts all commonly
    // export async default functions — relax promise-handler misuse
    // checks only where Server Actions get passed as event handlers
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
  {
    // Next.config.js/mjs is often CommonJS for compatibility reasons —
    // don't force ESM conversion on it
    files: ['next.config.{js,mjs,ts}'],
    rules: {
      'unicorn/prefer-module': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
  {
    // Third-party library APIs dictate exact property casing here —
    // e.g. postgres.js (`idle_timeout`, `connect_timeout`), Playwright
    // (`baseURL`), and similar config objects. Renaming these breaks the
    // library contract, so naming-convention is disabled only in these
    // specific files rather than loosened project-wide.
    files: [
      '**/db-client.ts',
      '**/drizzle/**/*.{ts,mts}',
      'playwright.config.ts',
    ],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      'unicorn/prefer-module': 'off',
    },
  },

  // --- Optional: uncomment to enable Next.js-specific correctness rules
  // (no-img-element, no-html-link-for-pages, no-sync-scripts, etc.)
  // Requires: npm install --save-dev @next/eslint-plugin-next
  // {
  //   files: ['**/*.{ts,tsx}'],
  //   plugins: {
  //     '@next/next': nextPlugin,
  //   },
  //   rules: {
  //     ...nextPlugin.configs.recommended.rules,
  //     ...nextPlugin.configs['core-web-vitals'].rules,
  //   },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      'import-x/no-unassigned-import': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
];

export default xoConfig;
