import tailwindcss from '@tailwindcss/vite'
import {defineConfig, postcssIsolateStyles} from 'vitepress'
import llmstxt, {copyOrDownloadAsMarkdownButtons} from 'vitepress-plugin-llms'

import {existsSync} from 'node:fs'
import {URL, fileURLToPath} from 'node:url'

import {svgComponent} from '../../build/svg-component'

const src = fileURLToPath(new URL('../../src', import.meta.url))

export default defineConfig({
  title: 'eco-vue-js',
  description: 'Vue 3 UI kit with Tailwind v4 — components, utilities, icons and recipes.',
  base: '/eco-vue-js/',
  cleanUrls: true,

  // Component pages live next to their component; guides and recipes live in docs/.
  srcDir: '..',
  srcExclude: ['node_modules/**', 'package/**', '*.md', 'docs/.vitepress/**'],
  rewrites: {
    'docs/:page.md': ':page.md',
    'docs/:section/:page.md': ':section/:page.md',
    'src/components/:component/docs/index.md': 'components/:component.md',
  },
  lastUpdated: true,

  themeConfig: {
    search: {provider: 'local'},

    sidebar: [
      {
        text: 'Guide',
        items: [
          {text: 'Getting started', link: '/guide/getting-started'},
          {text: 'Conventions', link: '/guide/conventions'},
        ],
      },
      {
        text: 'Components',
        items: [
          {text: 'Button', link: '/components/Button'},
        ],
      },
      {
        text: 'Assets',
        items: [
          {text: 'Icons', link: '/icons'},
        ],
      },
      {
        text: 'Recipes',
        items: [
          {text: 'List with fields', link: '/recipes/list-with-fields'},
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/rsmple/eco-vue-js/edit/main/:path',
    },
  },

  markdown: {
    config(md) {
      md.use(copyOrDownloadAsMarkdownButtons)
    },
  },

  vite: {
    // srcDir is the repo root, where Vite would otherwise pick up the library build config.
    configFile: false,
    plugins: [
      tailwindcss(),
      svgComponent(),
      llmstxt({
        domain: 'https://rsmple.github.io',
        ignoreFiles: ['index.md'],
      }),
      {
        // Examples import the kit by the same paths consumers use, so they can be copied as-is.
        name: 'eco-vue-js-source',
        enforce: 'pre',
        resolveId(id) {
          if (!id.startsWith('eco-vue-js/dist/')) return
          const path = `${ src }/${ id.slice('eco-vue-js/dist/'.length) }`
          if (id.startsWith('eco-vue-js/dist/assets/icons/')) return `${ path }.svg`
          if (existsSync(path)) return path
          return `${ path }.ts`
        },
      },
    ],
    resolve: {
      alias: {'@': src},
    },
    css: {
      postcss: {
        // Makes `vp-raw` work: demos opt out of the `.vp-doc` typography around them.
        plugins: [postcssIsolateStyles()],
      },
    },
    ssr: {
      noExternal: ['vitepress-plugin-llms'],
    },
  },
})
