import tseslint from 'typescript-eslint'
import { tanstackConfig } from '@tanstack/eslint-config'

export default [
    {
        ignores: ['eslint.config.js'],
    },

    ...tanstackConfig,
    ...tseslint.configs.recommendedTypeChecked,

    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
]
