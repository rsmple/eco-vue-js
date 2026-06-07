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
        const importPath = node.source.value

        // Check if import is of a modal component
        if (importPath.includes('@') && importPath.includes('Modal')) {
          const defaultImport = node.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier')

          if (defaultImport) {
            // Check if import method is not defineAsyncComponent
            if (node.importKind !== 'type' && node.importKind !== 'typeof') {
              context.report({
                node,
                message: `Imported modal component '${ defaultImport.local.name }' should use defineAsyncComponent`,
                fix: function (fixer) {
                  const replacement = `const ${ defaultImport.local.name } = defineAsyncComponent(() => import('${ importPath }'))`
                  return fixer.replaceText(node, replacement)
                },
              })
            }
          }
        }
      },
    }
  },
}