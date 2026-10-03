import tailwindcss from '@tailwindcss/vite'
import {defineConfig, postcssIsolateStyles} from 'vitepress'
import llmstxt, {copyOrDownloadAsMarkdownButtons} from 'vitepress-plugin-llms'

import {existsSync, readFileSync} from 'node:fs'
import {URL, fileURLToPath} from 'node:url'

import {buildSidebar, rewrite} from './sidebar.ts'
import {THEME_HEAD_SCRIPT} from './themeHeadScript.ts'

import {svgComponent} from '../../build/svg-component.ts'

const root = fileURLToPath(new URL('../..', import.meta.url))
const src = fileURLToPath(new URL('../../src', import.meta.url))
const {version} = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {version: string}

const base = '/eco-vue-js/'
const siteUrl = `https://rsmple.github.io${ base }`

export default defineConfig({
  title: 'EcoVue UI Library',
  description: 'One Vue 3 UI kit for your entire ecosystem — lists, forms and a data layer for complex data, live theming, icons and a ready project setup on Tailwind v4.',
  base,
  cleanUrls: true,

  // `head` hrefs are not prefixed with `base`; crawlers need absolute image URLs.
  head: [
    ['link', {rel: 'icon', href: `${ base }favicon.ico`, sizes: '48x48'}],
    ['link', {rel: 'icon', href: `${ base }favicon.svg`, type: 'image/svg+xml'}],
    ['link', {rel: 'apple-touch-icon', href: `${ base }apple-touch-icon.png`}],
    ['meta', {property: 'og:type', content: 'website'}],
    ['meta', {property: 'og:site_name', content: 'EcoVue UI Library'}],
    ['meta', {property: 'og:image', content: `${ siteUrl }og.png`}],
    ['meta', {property: 'og:image:width', content: '1200'}],
    ['meta', {property: 'og:image:height', content: '630'}],
    ['meta', {name: 'twitter:card', content: 'summary_large_image'}],
    // The theme picked in the header, applied before the first paint.
    ['script', {}, THEME_HEAD_SCRIPT],
  ],

  transformHead({pageData, title, description}) {
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')

    return [
      ['meta', {property: 'og:title', content: title}],
      ['meta', {property: 'og:description', content: description}],
      ['meta', {property: 'og:url', content: siteUrl + path}],
    ]
  },

  sitemap: {hostname: siteUrl},

  // Component pages live next to their component; guides and recipes live in docs/.
  srcDir: '..',
  srcExclude: ['node_modules/**', 'package/**', 'plans/**', '*.md', 'docs/.vitepress/**'],
  rewrites: rewrite,
  lastUpdated: true,

  themeConfig: {
    search: {provider: 'local'},

    // Shown in the header bar; the releases page is generated from GitHub releases by build/docs-releases.ts.
    nav: [
      {text: 'Guide', link: '/guide/getting-started', activeMatch: '^/guide/'},
      {text: 'Components', link: '/components/button', activeMatch: '^/components/'},
      {text: 'Recipes', link: '/recipes/list-with-fields', activeMatch: '^/recipes/'},
      {text: `v${ version }`, link: '/releases', activeMatch: '^/releases'},
    ],

    sidebar: buildSidebar(root),

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
    // Resolved from srcDir, which is the repo root.
    publicDir: 'docs/public',
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
