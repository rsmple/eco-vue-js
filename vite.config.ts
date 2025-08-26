import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import tailwindcss from 'tailwindcss'
import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import svgLoader from 'vite-svg-loader'

import {existsSync, renameSync, rmSync} from 'node:fs'
import {URL, fileURLToPath} from 'node:url'

import {writeImports} from './build/write-imports'

export default defineConfig(({mode}) => ({
  plugins: [
    {
      name: 'pre-build-hook',
      enforce: 'pre',
      async buildStart() {
        return await writeImports()
      },
    },
    dts({
      tsconfigPath: 'tsconfig.vue.json',
      entryRoot: 'src',
      copyDtsFiles: true,
    }),
    vue(),
    svgLoader({defaultImport: 'component', svgo: false}),
    {
      name: 'atomic-dist-swap',
      closeBundle() {
        if (mode !== 'development') return

        const tempDir = 'package/dist-temp'
        const finalDir = 'package/dist'

        if (existsSync(tempDir)) {
          if (existsSync(finalDir)) {
            rmSync(finalDir, {recursive: true, force: true})
          }
          renameSync(tempDir, finalDir)
        }
      },
    },
  ],
  css: {
    postcss: {
      plugins: [postcssImport(), tailwindcss({config: './tailwind/tailwind.config.ts'}), autoprefixer()],
    },
  },
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
        entryFileNames: '[name].js',
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
}))
