/// <reference types='vitest' />
import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const require = createRequire(import.meta.url)

const SPECS = [
  { name: 'openapi', out: 'llms.txt' },
  { name: 'blog', out: 'llms-blog.txt' },
  { name: 'course', out: 'llms-course.txt' },
  { name: 'billing', out: 'llms-billing.txt' },
] as const

function llmsTxtPlugin(): Plugin {
  return {
    name: 'llms-txt',
    apply: 'build',
    async closeBundle() {
      const outDir = resolve(import.meta.dirname, 'dist')

      for (const { name, out } of SPECS) {
        const spec = require(`@egolia-uit/api/${name}`)
        const markdown = await createMarkdownFromOpenApi(spec)
        writeFileSync(resolve(outDir, out), markdown, 'utf-8')
      }
    },
  }
}

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: './node_modules/.vite/apps/api-web',
  server: {
    port: 9080,
    host: true,
  },
  preview: {
    port: 9080,
    host: true,
  },
  plugins: [react(), llmsTxtPlugin()],
  base: '/egolia/api/',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/c-[name]-[hash].js',
        assetFileNames: 'assets/c-[hash][extname]',
      },
    },
  },
}))
