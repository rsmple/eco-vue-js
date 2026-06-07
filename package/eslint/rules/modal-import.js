export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure defineAsyncComponent is not called inside functions or passed as arguments',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    return {
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'defineAsyncComponent') {
          const parentFunction = (sourceCode.getAncestors ? sourceCode.getAncestors(node, node) : context.getAncestors()).find(ancestor => ancestor.type === 'FunctionDeclaration' || ancestor.type === 'ArrowFunctionExpression')

          if (parentFunction) {
            const importPath = node.arguments[0].body.source.value
            const componentName = importPath.substring(importPath.lastIndexOf('/') + 1, importPath.lastIndexOf('.'))

            context.report({
              node: node,
              message: 'defineAsyncComponent should not be called inside functions or passed as arguments',
              fix: function (fixer) {
                return [
                  fixer.replaceText(node, componentName),
                  fixer.insertTextAfterRange(
                    (sourceCode.getAncestors ? sourceCode.getAncestors(node, node) : context.getAncestors())[0].body
                      .slice()
                      .reverse()
                      .find(item => item.type === 'ImportDeclaration').source.range,
                    `\n\nconst ${ componentName } = defineAsyncComponent(() => import('${ importPath }'));`,
                  ),
                ]
              },
            })
          }
        }
      },
    }
  },
}
