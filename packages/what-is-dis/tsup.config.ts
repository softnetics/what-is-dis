import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  minify: true,
  dts: true,
  bundle: true,
  clean: false,
  format: ['cjs', 'esm'],
  sourcemap: true,
})
