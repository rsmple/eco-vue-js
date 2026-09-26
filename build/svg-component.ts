import type {Plugin} from 'vite'

import {compileTemplate} from 'vue/compiler-sfc'

import {readFileSync} from 'node:fs'

export const svgComponent = (): Plugin => ({
  name: 'svg-component',
  enforce: 'pre',
  load: {
    filter: {id: /\.svg(\?component)?$/},
    handler(id: string) {
      const path = id.split('?', 2)[0]
      const svg = readFileSync(path, 'utf-8')
      const {code} = compileTemplate({id, source: svg, filename: path, transformAssetUrls: false})
      return code + '\nexport default {render}'
    },
  },
})
