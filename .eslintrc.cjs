/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
    project: ['./tsconfig.json']
  },
  rules: {
    'no-unused-vars': 'off',
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off',
    // TypeScript相关规则，设置为警告级别以便渐进式迁移
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-empty-function': 'warn'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.vue'],
      rules: {
        // 针对TS文件的特殊规则
      }
    },
    {
      files: ['*.js', '*.jsx', '*.cjs', '*.mjs'],
      rules: {
        // 针对JS文件的宽松规则
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
}
