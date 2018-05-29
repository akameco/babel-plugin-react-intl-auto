// @flow
import p from 'path'
import * as t from 'babel-types'
import murmur from 'murmurhash3js'
import type { State } from './types'
// import blog from 'babel-log'

const isImportLocalName = (
  name: string,
  allowedNames: $ReadOnlyArray<string>,
  { file }: State
) => {
  let isImported = false
  file.path.traverse({
    ImportDeclaration: {
      exit(path) {
        const { node } = path
        if (node.source.value !== 'react-intl') {
          return
        }
        for (const specifier of path.get('specifiers')) {
          if (
            specifier.isImportSpecifier() &&
            allowedNames.includes(specifier.node.imported.name)
          ) {
            isImported = specifier.node.local.name === name
          }
        }
      },
    },
  })
  return isImported
}

const REG = new RegExp(`\\${p.sep}`, 'g')

const dotPath = (str: string) => str.replace(REG, '.')

const getPrefix = (
  {
    file: {
      opts: { filename },
    },
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
  if (
    !callee.isIdentifier() ||
    !isImportLocalName(callee.node.name, ['defineMessages'], state) ||
    !path.get('arguments.0')
  ) {
    return false
  }

  return true
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

const replaceProperties = (
  properties: $ReadOnlyArray<Object>,
  state: State,
  exportName: string | null
) => {
  const prefix = getPrefix(state, exportName)

  for (const prop of properties) {
    const propValue = prop.get('value')

    const messageDescriptorProperties: Object[] = []

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
    }

    // 'hello' or `hello ${user}`
    if (isLiteral(propValue)) {
      const id = getId(prop.get('key'), prefix)

      messageDescriptorProperties.push(
        objectProperty('id', id),
        objectProperty('defaultMessage', propValue.node)
      )
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

  return { id: idPath, defaultMessage: defaultMessagePath }
}

const createHash = message => `${murmur.x86.hash32(message)}`

const generateId = (defaultMessage: Object, state: State) => {
  const messageValuePath = defaultMessage.get('value')

  let message

  // Use the message as is if it's a string
  if (messageValuePath.isStringLiteral()) {
    message = defaultMessage.node.value.value
  } else {
    // Evaluate the message expression to see if it yields a string
    const evaluated = messageValuePath.get('expression').evaluate()

    if (evaluated.confident && typeof evaluated.value === 'string') {
      message = evaluated.value
    } else {
      throw messageValuePath.buildCodeFrameError(
        '[React Intl Auto] Messages must be statically evaluate-able for extraction.'
      )
    }
  }

  // ID is comprised of the path to the file and a hash
  // of the defaultMessage
  const hash = createHash(message)
  const prefix = getPrefix(state, hash)

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
    const { id, defaultMessage } = getElementAttributePaths(element)

    // If valid message but missing ID, generate one
    if (!id && defaultMessage) {
      generateId(defaultMessage, state)
    }
  }
}

export default function() {
  return {
    name: 'react-intl-auto',
    visitor: {
      JSXElement: visitJSXElement,
      CallExpression(path: Object, state: State) {
        if (!isValidate(path, state)) {
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
