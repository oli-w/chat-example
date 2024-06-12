import eslintPrettierRecommended from 'eslint-plugin-prettier/recommended';
import jsEslint from '@eslint/js';
import tsEslint from 'typescript-eslint';

export default [
    jsEslint.configs.recommended,
    ...tsEslint.configs.recommended,
    {
        rules: {
            'prefer-template': 'error',
            'object-shorthand': 'error',
            // Disables below
            '@typescript-eslint/ban-types': [
                'error',
                {
                    types: {
                        '{}': false,
                    },
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-prototype-builtins': 'off',
            'no-unused-vars': 'off',
        },
    },
    eslintPrettierRecommended,
    {
        ignores: ['**/build/**', '**/node_modules/**', '.idea/**', '.yalc/**'],
    },
];
