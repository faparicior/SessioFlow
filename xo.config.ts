import type {FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
  {
    space: true,
    semicolon: true,
    react: true,
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@stylistic/max-len': ['error', 100],
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
