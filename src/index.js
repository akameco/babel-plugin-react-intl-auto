// @flow
import p from 'path'
import * as t from '@babel/types'
import murmur from 'murmurhash3js'
import type { State } from './types'
// import blog from 'babel-log'

const isImportLocalName = (
  name: string,
  allowedNames: $ReadOnlyArray<string>,
  { file }: State
) => {
  const isSearchedImportSpecifier = specifier =>
    specifier.isImportSpecifier() &&
    allowedNames.includes(specifier.node.imported.name) &&
    specifier.node.local.name === name

  let isImported = false

  file.path.traverse({
    ImportDeclaration: {
      exit(path) {
        isImported =
          path.node.source.value.includes('react-intl') &&
          path.get('specifiers').some(isSearchedImportSpecifier)

        if (isImported) {
          path.stop()
        }
      },
    },
  })

  return isImported
}

const REG = new RegExp(`\\${p.sep}`, 'gu')

const dotPath = (str: string) => str.replace(REG, '.')

const getPrefix = (
  {
    file: {
      opts: { filename },
    },
    opts: { removePrefix, filebase = false },
  }: State,
  exportName: string | null
) => {
  if (removePrefix === true) {
    return exportName === null ? '' : exportName
  }
  const file = p.relative(process.cwd(), filename)
  const fomatted = filebase ? file.replace(/\..+$/u, '') : p.dirname(file)
  removePrefix =
    removePrefix === undefined || removePrefix === false ? '' : removePrefix
  const fixed =
    removePrefix instanceof RegExp
      ? dotPath(fomatted.replace(removePrefix, ''))
      : dotPath(fomatted).replace(
          new RegExp(
            `^${removePrefix.replace(/\//gu, '')}\\${dotPath(p.sep)}?`,
            'u'
          ),
          ''
        )

  if (exportName === null) {
    return fixed
  }

  if (fixed === '') {
    return exportName
  }

  return `${fixed}.${exportName}`
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

const isDefineMessagesCall = (path: Object, state: State): boolean => {
  const callee = path.get('callee')

  return (
    callee.isIdentifier() &&
    isImportLocalName(callee.node.name, ['defineMessages'], state) &&
    Boolean(path.get('arguments.0'))
  )
}

const getLeadingComment = prop => {
  const commentNodes = prop.node.leadingComments
  return commentNodes
    ? commentNodes.map(node => node.value.trim()).join('\n')
    : null
}

const objectProperty = (key, value) => {
  const valueNode = typeof value === 'string' ? t.stringLiteral(value) : value
  return t.objectProperty(t.stringLiteral(key), valueNode)
}

// eslint-disable-next-line max-lines-per-function
const replaceProperties = (
  properties: $ReadOnlyArray<Object>,
  state: State,
  exportName: string | null
) => {
  const prefix = getPrefix(state, exportName)

  for (const prop of properties) {
    const propValue = prop.get('value')

    const messageDescriptorProperties: Array<Object> = []

    // { defaultMessage: 'hello', description: 'this is hello' }
    if (propValue.isObjectExpression()) {
      const objProps = propValue.get('properties')

      // { id: 'already has id', defaultMessage: 'hello' }
      const isNotHaveId = objProps.every(v => v.get('key').node.name !== 'id')
      if (isNotHaveId) {
        const id = getId(prop.get('key'), prefix)

        messageDescriptorProperties.push(objectProperty('id', id))
      }

      messageDescriptorProperties.push(...objProps.map(v => v.node))
    } else if (isLiteral(propValue)) {
      // 'hello' or `hello ${user}`
      const id = getId(prop.get('key'), prefix)

      messageDescriptorProperties.push(
        objectProperty('id', id),
        objectProperty('defaultMessage', propValue.node)
      )
    } else {
      const evaluated = prop.get('value').evaluate()
      if (evaluated.confident && typeof evaluated.value === 'string') {
        const id = dotPath(p.join(prefix, evaluated.value))

        messageDescriptorProperties.push(
          objectProperty('id', id),
          objectProperty('defaultMessage', propValue.node)
        )
      }
    }

    const { extractComments = true } = state.opts

    if (extractComments) {
      const hasDescription = messageDescriptorProperties.find(
        v => v.key.name === 'description'
      )

      if (!hasDescription) {
        const description = getLeadingComment(prop)

        if (description) {
          messageDescriptorProperties.push(
            objectProperty('description', description)
          )
        }
      }
    }

    propValue.replaceWith(t.objectExpression(messageDescriptorProperties))
  }
}

const getExportName = (path, includeExportName): string | null => {
  const namedExport = path.findParent(v => v.isExportNamedDeclaration())
  const defaultExport = path.findParent(v => v.isExportDefaultDeclaration())

  if (includeExportName && namedExport) {
    return namedExport.get('declaration.declarations.0.id.name').node
  }

  if (includeExportName === 'all' && defaultExport) {
    return 'default'
  }

  return null
}

function getProperties(path): $ReadOnlyArray<Object> | null {
  if (path.isObjectExpression()) {
    return path.get('properties')
  } else if (path.isIdentifier()) {
    const { name } = path.node
    const obj = path.scope.getBinding(name)
    if (!obj) {
      return null
    }
    return obj.path.get('init.properties')
  }
  return null
}

// Process react-intl components
const REACT_COMPONENTS = ['FormattedMessage', 'FormattedHTMLMessage']

const getElementAttributePaths = (elementPath: Object): Object => {
  if (!elementPath) {
    return {}
  }

  const attributesPath = elementPath.get('attributes')

  const defaultMessagePath = attributesPath.find(
    attrPath =>
      attrPath.node.name && attrPath.node.name.name === 'defaultMessage'
  )

  const idPath = attributesPath.find(
    attrPath => attrPath.node.name && attrPath.node.name.name === 'id'
  )

  const keyPath = attributesPath.find(
    attrPath => attrPath.node.name && attrPath.node.name.name === 'key'
  )

  return { id: idPath, defaultMessage: defaultMessagePath, key: keyPath }
}

const createHash = message => `${murmur.x86.hash32(message)}`

const extractFromValuePath = (valueObject: ?Object) => {
  if (!valueObject) {
    return null
  }
  const valuePath = valueObject.get('value')
  if (valuePath) {
    if (valuePath.isStringLiteral()) {
      // Use the message as is if it's a string
      return valueObject.node.value.value
    }

    // Evaluate the message expression to see if it yields a string
    const evaluated = valuePath.get('expression').evaluate()
    if (evaluated.confident && typeof evaluated.value === 'string') {
      return evaluated.value
    }
    throw valuePath.buildCodeFrameError(
      `[React Intl Auto] ${
        valueObject.get('name').node.name
      } must be statically evaluate-able for extraction.`
    )
  }

  return null
}

const generateId = (defaultMessage: Object, state: State, key: ?Object) => {
  // ID = path to the file + key
  let suffix = state.opts.useKey ? extractFromValuePath(key) : ''
  if (!suffix) {
    // ID = path to the file + hash of the defaultMessage
    const messageValue = extractFromValuePath(defaultMessage)
    if (messageValue) {
      suffix = createHash(messageValue)
    }
  }

  const prefix = getPrefix(state, suffix)

  // Insert an id attribute before the defaultMessage attribute
  defaultMessage.insertBefore(
    t.jSXAttribute(t.jSXIdentifier('id'), t.stringLiteral(prefix))
  )
}

const visitJSXElement = (path: Object, state: State) => {
  const element = path.get('openingElement')

  // Is this a react-intl component? Handles both:
  // import { FormattedMessage as T } from 'react-intl'
  // import { FormattedMessage } from 'react-intl'
  if (isImportLocalName(element.node.name.name, REACT_COMPONENTS, state)) {
    // Get the attributes for the component
    const { id, defaultMessage, key } = getElementAttributePaths(element)

    // If valid message but missing ID, generate one
    if (!id && defaultMessage) {
      generateId(defaultMessage, state, state.opts.useKey ? key : null)
    }
  }
}

export default function() {
  return {
    name: 'react-intl-auto',
    visitor: {
      JSXElement: visitJSXElement,
      CallExpression(path: Object, state: State) {
        if (!isDefineMessagesCall(path, state)) {
          return
        }

        const properties = getProperties(path.get('arguments.0'))

        if (properties) {
          const exportName = getExportName(
            path,
            state.opts.includeExportName || false
          )
          replaceProperties(properties, state, exportName)
        }
      },
    },
  }
}
