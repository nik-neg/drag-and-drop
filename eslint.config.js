// eslint.config.js
import eslint from '@eslint/js';
import designSystemPlugin from "@atlaskit/eslint-plugin-design-system";
import uiStylingStandardPlugin from "@atlaskit/eslint-plugin-ui-styling-standard";

export default [
    eslint.configs.recommended,
    {
        plugins: {
            "@atlaskit/design-system": designSystemPlugin,
            "@atlaskit/ui-styling-standard": uiStylingStandardPlugin,
        },
        rules: {
            semi: "error",
            "prefer-const": "error",
            "@atlaskit/design-system/no-banned-imports": "error",
            "@atlaskit/ui-styling-standard/no-unsafe-values": "error",
            "@atlaskit/ui-styling-standard/no-imported-style-values": "error",
        },
    },
];
