// @flow
import p from 'path'
import * as t from 'babel-types'

const PKG_NAME = 'react-intl'
const FUNC_NAME = 'defineMessages'

const getPrefix = (filename: string, removePrefix: string) => {
  const relativePath = p.dirname(p.join(p.relative(process.cwd(), filename)))
  const prefix = relativePath.replace(new RegExp(`^${removePrefix}`), '')
  return prefix
}

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

function isObjectExpression(node: Object) {
  return node && node.isObjectExpression()
}

function isDefaultMessage(path: Object): boolean {
  const key = path.get('key')
  if (!t.isIdentifier(key)) {
    return false
  }
  return key.node.name === 'defaultMessage'
}

function insertIdToMessageObj(path: Object, prefix: string) {
  const parentPath = path.findParent(p => p.isObjectProperty())
  const parentKey = parentPath.get('key')
  if (!(parentKey.isIdentifier() && parentKey.node.name)) {
    return
  }
  const id = p.join(prefix, parentKey.node.name)
  path.insertAfter(t.objectProperty(t.stringLiteral('id'), t.stringLiteral(id)))
}

export default function({ types: t }: Object) {
  return {
    visitor: {
      CallExpression(path: Object, state: Object) {
        const callee = path.get('callee')
        if (
          !callee.isIdentifier() &&
          !isImportLocalName(callee.node.name, state)
        ) {
          return
        }

        const messagesObj = path.get('arguments')[0]

        if (!isObjectExpression(messagesObj)) {
          return
        }

        const prefix = getPrefix(
          state.file.opts.filename,
          state.opts.removePrefix || ''
        )

        const properties = messagesObj.get('properties')
        properties.forEach(prop => {
          prop
            .get('value')
            .get('properties')
            .filter(isDefaultMessage)
            .forEach(prop => insertIdToMessageObj(prop, prefix))
        })
      },
    },
  }
}
