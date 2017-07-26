// @flow
import p from 'path'
import * as t from 'babel-types'
import type { State } from './types'

const PKG_NAME = 'react-intl'
const FUNC_NAME = 'defineMessages'

const isImportLocalName = (name: string, { file }: State) => {
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

const getPrefix = ({
  file: { opts: { filename } },
  opts: { removePrefix = '' },
}: State) => {
  const relativePath = p.dirname(p.join(p.relative(process.cwd(), filename)))
  const prefix = relativePath.replace(new RegExp(`^${removePrefix}/?`), '')
  return prefix
}

const getId = (path, prefix) => {
  if (!(path.isIdentifier() && path.node.name)) {
    return false
  }
  return p.join(prefix, path.node.name).replace(/\//g, '.')
}

const isLiteral = node => t.isStringLiteral(node) || t.isTemplateLiteral(node)

export default function({ types: t }: Object) {
  return {
    visitor: {
      CallExpression(path: Object, state: State) {
        const callee = path.get('callee')
        if (!callee.isIdentifier()) {
          return
        }

        if (!isImportLocalName(callee.node.name, state)) {
          return
        }

        const messagesObj = path.get('arguments')[0]
        if (!messagesObj) {
          return
        }

        if (!(messagesObj.isObjectExpression() || messagesObj.isIdentifier())) {
          return
        }

        let properties

        if (messagesObj.isObjectExpression()) {
          properties = messagesObj.get('properties')
        } else if (messagesObj.isIdentifier()) {
          const name = messagesObj.node.name
          const obj = messagesObj.scope.getBinding(name)
          if (!obj) {
            return
          }
          properties = obj.path.get('init').get('properties')
        }

        if (!properties) {
          return
        }

        const prefix = getPrefix(state)

        for (const prop of properties) {
          const v = prop.get('value')

          // { defaultMessage: 'hello', description: 'this is hello' }
          if (v.isObjectExpression()) {
            const objProps = v.get('properties')

            // { id: 'already has id', defaultMessage: 'hello' }
            const isNotHaveId = objProps.every(
              v => v.get('key').node.name !== 'id'
            )
            if (!isNotHaveId) {
              continue
            }

            const id = getId(prop.get('key'), prefix)

            v.replaceWith(
              t.objectExpression([
                t.objectProperty(t.stringLiteral('id'), t.stringLiteral(id)),
                ...objProps.map(v => v.node),
              ])
            )
          }

          // 'hello' or `hello ${user}`
          if (isLiteral(v)) {
            const id = getId(prop.get('key'), prefix)

            v.replaceWith(
              t.objectExpression([
                t.objectProperty(t.stringLiteral('id'), t.stringLiteral(id)),
                t.objectProperty(t.stringLiteral('defaultMessage'), v.node),
              ])
            )
          }
        }
      },
    },
  }
}
