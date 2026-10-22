import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist', 'node_modules', 'tests'] },
  {
    files: ['site/**/*.js'],
    ...js.configs.recommended,
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser } },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    ...js.configs.recommended,
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } },
  },
  {
    files: ['google-apps-script/**/*.gs'],
    ...js.configs.recommended,
    languageOptions: { ecmaVersion: 2019, sourceType: 'script', globals: { SpreadsheetApp: 'readonly', ContentService: 'readonly', MailApp: 'readonly', Utilities: 'readonly', LockService: 'readonly' } },
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^do(Post|Get)$' }] },
  },
]
