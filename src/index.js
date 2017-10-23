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

const REG = new RegExp(`\\${p.sep}`, 'g')

const dotPath = (str: string) => str.replace(REG, '.')

const getPrefix = (
  {
    file: { opts: { filename } },
    opts: { removePrefix = '', filebase = false },
  }: State,
  exportName: string | null
) => {
  if (removePrefix === true) {
    return exportName === null ? '' : exportName
  }
  const file = p.relative(process.cwd(), filename)
  const fomatted = filebase ? file.replace(/\..+$/, '') : p.dirname(file)
  removePrefix = removePrefix === false ? '' : removePrefix
  const fixed = dotPath(fomatted).replace(
    new RegExp(`^${removePrefix.replace(/\//g, '')}\\${dotPath(p.sep)}?`),
    ''
  )
  const result = exportName === null ? fixed : `${fixed}.${exportName}`
  return result
}

const getId = (path, prefix) => {
  let name

  if (path.isStringLiteral()) {
    name = path.node.value
  } else if (path.isIdentifier()) {
    name = path.node.name
  }

  if (!name) {
    throw new Error(`requires Object key or string literal`)
  }

  return dotPath(p.join(prefix, name))
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

const replaceProperties = (
  properties: $ReadOnlyArray<Object>,
  state,
  exportName: string | null
) => {
  const prefix = getPrefix(state, exportName)

  for (const prop of properties) {
    const objProp = prop.get('value')

    // { defaultMessage: 'hello', description: 'this is hello' }
    if (objProp.isObjectExpression()) {
      const objProps = objProp.get('properties')

      // { id: 'already has id', defaultMessage: 'hello' }
      const isNotHaveId = objProps.every(v => v.get('key').node.name !== 'id')
      if (!isNotHaveId) {
        continue // eslint-disable-line
      }

      const id = getId(prop.get('key'), prefix)

      objProp.replaceWith(
        t.objectExpression([
          t.objectProperty(t.stringLiteral('id'), t.stringLiteral(id)),
          ...objProps.map(v => v.node),
        ])
      )

      // 'hello' or `hello ${user}`
    } else if (isLiteral(objProp)) {
      const id = getId(prop.get('key'), prefix)

      objProp.replaceWith(
        t.objectExpression([
          t.objectProperty(t.stringLiteral('id'), t.stringLiteral(id)),
          t.objectProperty(t.stringLiteral('defaultMessage'), objProp.node),
        ])
      )
    }
  }
}

const getExportName = (
  namedExport,
  defaultExport,
  includeExportName
): string | null => {
  if (includeExportName && namedExport) {
    return namedExport
      .get('declaration')
      .get('declarations')[0]
      .get('id')
      .get('name').node
  }

  if (includeExportName === 'all' && defaultExport) {
    return 'default'
  }

  return null
}

export default function() {
  return {
    name: 'react-intl-auto',
    visitor: {
      CallExpression(path: Object, state: State) {
        if (!isValidate(path, state)) {
          return
        }

        // eslint-disable-next-line
        const namedExport = path.findParent(p => p.isExportNamedDeclaration())
        // eslint-disable-next-line
        const defaultExport = path.findParent(p =>
          p.isExportDefaultDeclaration()
        )
        const exportName = getExportName(
          namedExport,
          defaultExport,
          state.opts.includeExportName || false
        )
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
          replaceProperties(properties, state, exportName)
        }
      },
    },
  }
}
