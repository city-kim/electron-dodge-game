import eslintConfig from './eslint.config.mjs'

const lintStagedEslintConfig = [
  ...eslintConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
]

export default lintStagedEslintConfig
