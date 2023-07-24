import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import svgLoader from 'vite-svg-loader'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import postcssImport from 'postcss-import'

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: 'tsconfig.app.json',
      entryRoot: 'src',
      copyDtsFiles: true,
    }),
    vue(),
    svgLoader({defaultImport: 'component'}),
  ],
  css: {
    postcss: {
      plugins: [postcssImport(), tailwindcss({config: './tailwind/tailwind.config.cjs'}), autoprefixer()],
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: false,
    lib: {
      entry: 'src/main.ts',
      name: 'ui-kit',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'vue-query'],
      output: {
        preserveModules: true,
        entryFileNames: '[name].js',
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'vue-query': 'VueQuery',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
