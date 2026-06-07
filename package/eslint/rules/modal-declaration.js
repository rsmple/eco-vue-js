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
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    const filename = context.filename ?? context.getFilename()
    return {
      Program(node) {
        const baseName = filename

        if (!baseName.endsWith('.vue') || baseName.includes('Modal')) return

        const templateNode = node.templateBody
        if (!templateNode) return

        if (!sourceCode.getText(templateNode).includes('<WModalWrapper')) return
  
        context.report({
          node,
          message: `Component with <WModalWrapper> should contain "Modal" in file name`,
        })
      },
    }
  },
}