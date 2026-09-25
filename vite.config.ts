import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import {type UserConfig, defineConfig} from 'vite'
import dts from 'vite-plugin-dts'

import {existsSync, renameSync, rmSync} from 'node:fs'
import {URL, fileURLToPath} from 'node:url'

import {svgComponent} from './build/svg-component'
import {writeImports} from './build/write-imports'

await writeImports()

const tempDir = 'package/dist-temp'
const finalDir = 'package/dist'
const mainPath = 'src/main.ts'

export default defineConfig(({mode}) => ({
  plugins: [
    dts({
      tsconfigPath: 'tsconfig.vue.json',
      entryRoot: 'src',
      copyDtsFiles: true,
    }),
    tailwindcss(),
    vue(),
    svgComponent(),
    {
      name: 'atomic-dist-swap',
      closeBundle() {
        if (mode !== 'development') return

        if (existsSync(tempDir)) {
          if (existsSync(finalDir)) {
            rmSync(finalDir, {recursive: true, force: true})
          }
          renameSync(tempDir, finalDir)
        }
      },
    },
    {
      name: 'remove-main',
      closeBundle() {
        if (mode === 'development') return
        if (existsSync(mainPath)) rmSync(mainPath)
      },
    },
  ],
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: false,
    outDir: mode === 'development' ? 'package/dist-temp' : 'package/dist',
    lib: {
      entry: 'src/main.ts',
      name: 'ui-kit',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'vue-router', '@tanstack/vue-query'],
      output: {
        preserveModules: true,
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId?.endsWith('.vue')) return '[name].vue.js'
          return '[name].js'
        },
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          '@tanstack/vue-query': 'VueQuery',
        },
      },
    },
    watch: mode === 'development' ? {} : null,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}) satisfies UserConfig)
