import p from 'path'
import * as t from '@babel/types'
import { NodePath, PluginObj } from '@babel/core'
import { State } from './types'
import { isImportLocalName } from './isImportLocalName'
import { visitJSXElement } from './visitors/jsx'
import { createHash, dotPath } from './utils'
import { getPrefix } from './getPrefix'
// import blog from 'babel-log'

const getId = (path: NodePath, prefix: string) => {
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

const isLiteral = (node: NodePath) =>
  t.isStringLiteral(node) || t.isTemplateLiteral(node)

const isDefineMessagesCall = (
  path: NodePath<t.CallExpression>,
  state: State
): boolean => {
  const callee = path.get('callee')

  return (
    callee.isIdentifier() &&
    isImportLocalName(callee.node.name, ['defineMessages'], state) &&
    Boolean(path.get('arguments.0'))
  )
}

const getLeadingComment = (prop: NodePath) => {
  const commentNodes = prop.node.leadingComments
  return commentNodes
    ? commentNodes.map(node => node.value.trim()).join('\n')
    : null
}

const objectProperty = (key: string, value: string) => {
  const valueNode = typeof value === 'string' ? t.stringLiteral(value) : value
  return t.objectProperty(t.stringLiteral(key), valueNode)
}

// eslint-disable-next-line max-lines-per-function
const replaceProperties = (
  properties: NodePath<t.CallExpression>[],
  state: State,
  exportName: string | null
) => {
  const prefix = getPrefix(state, exportName)

  // Apparently a bug in eslint
  // eslint-disable-next-line no-unused-vars
  for (const prop of properties) {
    const propValue = prop.get('value') as any

    const messageDescriptorProperties: object[] = []

    // { defaultMessage: 'hello', description: 'this is hello' }
    if (propValue.isObjectExpression()) {
      const objProps = propValue.get('properties') as NodePath<
        t.ObjectProperty
      >[]

      // { id: 'already has id', defaultMessage: 'hello' }
      const isNotHaveId = objProps.every(
        (v: any) => v.get('key').node.name !== 'id'
      )
      if (isNotHaveId) {
        const id = getId(prop.get('key') as any, prefix)

        messageDescriptorProperties.push(objectProperty('id', id))
      }

      messageDescriptorProperties.push(...objProps.map(v => v.node))
    } else if (isLiteral(propValue)) {
      // 'hello' or `hello ${user}`
      const id = getId(prop.get('key') as any, prefix)

      messageDescriptorProperties.push(
        objectProperty('id', id),
        objectProperty('defaultMessage', propValue.node)
      )
    } else {
      const evaluated = (prop.get('value') as any).evaluate()
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
        (v: any) => v.key.name === 'description'
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
    propValue.replaceWith(
      t.objectExpression(messageDescriptorProperties as any)
    )
  }
}

const getExportName = (
  path: NodePath,
  includeExportName: boolean | 'all' | undefined
): string | null => {
  const namedExport = path.findParent(v => v.isExportNamedDeclaration())
  const defaultExport = path.findParent(v => v.isExportDefaultDeclaration())

  if (includeExportName && namedExport) {
    return (namedExport.get('declaration.declarations.0.id.name') as any).node
  }

  if (includeExportName === 'all' && defaultExport) {
    return 'default'
  }

  return null
}

function getProperties(path: NodePath) {
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

// check if given path is related to intl.formatMessage call
function isFormatMessageCall(path: NodePath<t.CallExpression>, state: State) {
  const callee = path.get('callee')
  const property = callee.get('property')
  const objectPath = callee.get('object')

  return (
    // injectIntl or useIntl imported
    isImportLocalName(null, ['injectIntl', 'useIntl'], state) &&
    callee.isMemberExpression() &&
    Boolean(path.get('arguments.0')) &&
    // intl object
    objectPath &&
    t.isIdentifier(objectPath) &&
    (objectPath as any).node.name === 'intl' &&
    // formatMessage property
    property &&
    t.isIdentifier(property) &&
    (property as any).node.name === 'formatMessage'
  )
}

// add automatic ID to intl.formatMessage calls
function addIdToFormatMessage(path: NodePath<t.CallExpression>, state: State) {
  if (!isFormatMessageCall(path, state)) {
    // skip path if this is not intl.formatMessage call
    return
  }

  // intl.formatMessage first argument is the one which we would like to modify
  const arg0 = path.get('arguments.0') as NodePath<t.ObjectExpression>

  const properties = getProperties(arg0) as any
  // blog(properties)

  // at least defaultMessage property is required to do anything useful
  if (!properties) {
    return
  }

  // if "id" property is already added by a developer or by this script just skip this node
  if (properties.find((arg: any) => arg.get('key').node.name === 'id')) {
    return
  }

  // Apparently a bug in eslint
  // eslint-disable-next-line no-unused-vars
  for (const prop of properties) {
    if (prop.get('key').node.name === 'defaultMessage') {
      // try to statically evaluate defaultMessage to generate hash
      const evaluated = prop.get('value').evaluate()

      if (!evaluated.confident || typeof evaluated.value !== 'string') {
        throw prop
          .get('value')
          .buildCodeFrameError(
            '[React Intl Auto] defaultMessage must be statically evaluate-able for extraction.'
          )
      }
      prop.insertAfter(
        objectProperty('id', getPrefix(state, createHash(evaluated.value)))
      )
    }
  }
}

function addIdToFormatedMessage(
  path: NodePath<t.CallExpression>,
  state: State
) {
  if (!isDefineMessagesCall(path, state)) {
    return
  }

  const properties = getProperties(path.get('arguments.0') as NodePath<
    t.ObjectExpression
  >)

  if (!properties) {
    return
  }

  const exportName = getExportName(path, state.opts.includeExportName || false)
  replaceProperties(properties as any, state, exportName)
}

export default function() {
  return {
    name: 'react-intl-auto',
    visitor: {
      JSXElement: visitJSXElement,
      CallExpression(path, state: State) {
        addIdToFormatMessage(path, state)
        addIdToFormatedMessage(path, state)
      },
    },
  } as PluginObj
}
