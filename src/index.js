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
  opts: { removePrefix = '', filebase = false },
}: State) => {
  const file = p.relative(process.cwd(), filename)
  const fomatted = filebase ? file.replace(/\..+$/, '') : p.dirname(file)
  const result = fomatted.replace(new RegExp(`^${removePrefix}/?`), '')
  return result
}

const getId = (path, prefix) => {
  if (!(path.isIdentifier() && path.node.name)) {
    throw new Error(`require Object key`)
  }
  return p.join(prefix, path.node.name).replace(/\//g, '.')
}

const isLiteral = node => t.isStringLiteral(node) || t.isTemplateLiteral(node)

const isValidate = (path: Object, state: State): boolean => {
  const callee = path.get('callee')
  if (!callee.isIdentifier()) {
    return false
  }

  if (!isImportLocalName(callee.node.name, state)) {
    return false
  }

  const messagesObj = path.get('arguments')[0]
  if (!messagesObj) {
    return false
  }

  if (!(messagesObj.isObjectExpression() || messagesObj.isIdentifier())) {
    return false
  }

  return true
}

const replaceProperties = (properties: Object[], state) => {
  const prefix = getPrefix(state)

  for (const prop of properties) {
    const v = prop.get('value')

    // { defaultMessage: 'hello', description: 'this is hello' }
    if (v.isObjectExpression()) {
      const objProps = v.get('properties')

      // { id: 'already has id', defaultMessage: 'hello' }
      const isNotHaveId = objProps.every(v => v.get('key').node.name !== 'id')
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

      // 'hello' or `hello ${user}`
    } else if (isLiteral(v)) {
      const id = getId(prop.get('key'), prefix)

      v.replaceWith(
        t.objectExpression([
          t.objectProperty(t.stringLiteral('id'), t.stringLiteral(id)),
          t.objectProperty(t.stringLiteral('defaultMessage'), v.node),
        ])
      )
    }
  }
}

export default function() {
  return {
    name: 'react-intl-auto',
    visitor: {
      CallExpression(path: Object, state: State) {
        if (!isValidate(path, state)) {
          return
        }

        const messagesObj = path.get('arguments')[0]

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

        if (properties) {
          replaceProperties(properties, state)
        }
      },
    },
  }
}
