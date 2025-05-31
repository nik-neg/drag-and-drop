import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import designSystemPlugin from "@atlaskit/eslint-plugin-design-system";
import uiStylingStandardPlugin from "@atlaskit/eslint-plugin-ui-styling-standard";

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      "@atlaskit/design-system": designSystemPlugin,
      "@atlaskit/ui-styling-standard": uiStylingStandardPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "@atlaskit/design-system/no-banned-imports": "error",
      "@atlaskit/ui-styling-standard/no-unsafe-values": "error",
      "@atlaskit/ui-styling-standard/no-imported-style-values": "error",
    },
  },
)
