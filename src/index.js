// @flow
import p from 'path'
import * as t from 'babel-types'

const PKG_NAME = 'react-intl'
const FUNC_NAME = 'defineMessages'

const isImportLocalName = (name: string, { file }: Object) => {
  const imports = file.metadata.modules.imports
  const intlImports = imports.find(x => x.source === PKG_NAME)
  if (intlImports) {
    const specifier = intlImports.specifiers.find(x => x.imported === FUNC_NAME)
    if (specifier) {
      return specifier.local === name
    }
  }

  return false
}

const getPrefix = (filename: string, removePrefix: string) => {
  const relativePath = p.dirname(p.join(p.relative(process.cwd(), filename)))
  const prefix = relativePath.replace(new RegExp(`^${removePrefix}`), '')
  return prefix
}

const getId = (path, prefix) => {
  if (!(path.isIdentifier() && path.node.name)) {
    return
  }
  return p.join(prefix, path.node.name)
}

const isLiteral = node => t.isStringLiteral(node) || t.isTemplateLiteral(node)

export default function({ types: t }: Object) {
  return {
    visitor: {
      CallExpression(path: Object, state: Object) {
        const callee = path.get('callee')
        if (!callee.isIdentifier()) {
          return
        }

        if (!isImportLocalName(callee.node.name, state)) {
          return
        }

        const messagesObj = path.get('arguments')[0]

        if (!(messagesObj && messagesObj.isObjectExpression())) {
          return
        }

        const prefix = getPrefix(
          state.file.opts.filename,
          state.opts.removePrefix || ''
        )

        const properties = messagesObj.get('properties')

        for (const prop of properties) {
          const v = prop.get('value')

          if (!isLiteral(v)) {
            continue
          }

          const id = getId(prop.get('key'), prefix)

          v.replaceWith(
            t.objectExpression([
              t.objectProperty(t.stringLiteral('id'), t.stringLiteral(id)),
              t.objectProperty(t.stringLiteral('defaultMessage'), v.node)
            ])
          )
        }
      }
    }
  }
}
