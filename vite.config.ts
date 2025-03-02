import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'
import tailwindcss from 'tailwindcss'
import {type CSSOptions, defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import svgLoader from 'vite-svg-loader'

import {URL, fileURLToPath} from 'node:url'

import {writeImports} from './build/write-imports'

export default defineConfig(({mode}) => ({
  plugins: [
    dts({
      tsconfigPath: 'tsconfig.vue.json',
      entryRoot: 'src',
      copyDtsFiles: true,
    }),
    vue(),
    svgLoader({defaultImport: 'component'}),
    {
      name: 'pre-build-hook',
      enforce: 'pre',
      buildStart() {
        return writeImports()
      },
    },
  ],
  css: {
    postcss: {
      plugins: [
        postcssImport(),
        tailwindcss({config: './tailwind/tailwind.config.ts'}),
        autoprefixer(),
      ] as CSSOptions['postcss'] extends {plugins: infer P} ? P : never,
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: false,
    outDir: 'package/dist',
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
