// @ts-check

/** @type {import('@trivago/prettier-plugin-sort-imports').PrettierConfig} */
const config = {
  singleQuote: true,
  semi: false,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'es5',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^dotenv', '^react', '<THIRD_PARTY_MODULES>', '^[.]', '^[.][.]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['decorators-legacy', 'jsx', 'typescript'],
}

module.exports = config
