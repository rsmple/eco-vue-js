import plugin from 'tailwindcss/plugin.js'

const pluginDefault = plugin(function ({addVariant}) {
  addVariant('card', ['.w-card &'])
  addVariant('card-l', ['&.w-card'])
  addVariant('list', ['.w-list &'])
  addVariant('list-l', ['&.w-list'])
})

export default pluginDefault
