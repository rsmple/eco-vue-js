export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Restrict specific imports and provide replacement',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
  },

  create: function (context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value
        const importSpecifiers = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier')

        importSpecifiers.forEach(specifier => {
          if (!source.includes('eco-vue-js')) return

          const importedName = specifier.imported.name

          if (importedName.startsWith('W')) {
            const replacementImport = `import ${ importedName } from 'eco-vue-js/dist/components/${ importedName.substr(1) }/${ importedName }.vue'`
            context.report({
              node,
              message: `Do not import '${ importedName }' directly. Use the replacement: ${ replacementImport }`,
              fix: function (fixer) {
                return fixer.replaceText(node, replacementImport)
              },
            })

            return
          }

          if (source.includes('iconsSax')) {
            const replacementImport = `import ${ importedName } from 'eco-vue-js/dist/assets/icons/sax/${ importedName }'`
            context.report({
              node,
              message: `Do not import '${ importedName }' directly. Use the replacement: ${ replacementImport }`,
              fix: function (fixer) {
                return fixer.replaceText(node, replacementImport)
              },
            })

            return
          }

          if (source.includes('iconsDefault')) {
            const replacementImport = `import ${ importedName } from 'eco-vue-js/dist/assets/icons/default/${ importedName }'`
            context.report({
              node,
              message: `Do not import '${ importedName }' directly. Use the replacement: ${ replacementImport }`,
              fix: function (fixer) {
                return fixer.replaceText(node, replacementImport)
              },
            })

            return
          }
        })
      },
    }
  },
}