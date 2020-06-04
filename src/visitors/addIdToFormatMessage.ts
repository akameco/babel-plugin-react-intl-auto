import { NodePath } from '@babel/core'
import * as t from '@babel/types'
import { State } from '../types'
import { getPrefix } from '../utils/getPrefix'
import { isImportLocalName } from '../utils/isImportLocalName'
import { createHash, objectProperty, getObjectProperties } from '../utils'
// import blog from 'babel-log'

// check if given path is related to intl.formatMessage call
function isFormatMessageCall(path: NodePath<t.CallExpression>, state: State) {
  // injectIntl or useIntl imported
  if (!isImportLocalName(null, ['injectIntl', 'useIntl'], state)) {
    return false
  }

  /*
    Path "MemberExpression"
    computed: false
    object: Node "Identifier"
      name: "intl"
    property: Node "Identifier"
      name: "formatMessage"
  */
  const callee = path.get('callee')
  if (!callee.isMemberExpression()) {
    return false
  }

  /*
    Path "Identifier"
    name: "formatMessage"
  */
  const property = callee.get('property')
  const isFormatMessage =
    !Array.isArray(property) &&
    property.isIdentifier() &&
    property.node.name === 'formatMessage'

  /*
    Path "Identifier"
      name: "intl"
  */
  const objectPath = callee.get('object')
  const isIntl =
    !Array.isArray(objectPath) &&
    objectPath.isIdentifier() &&
    objectPath.node.name === 'intl'

  return Boolean(path.get('arguments.0')) && isIntl && isFormatMessage
}

function findProperty(
  properties: NodePath<t.ObjectProperty>[],
  name: string
): NodePath<t.ObjectProperty> | undefined {
  return properties.find((arg) => {
    const keyPath = arg.get('key')
    return !Array.isArray(keyPath) && keyPath.node.name === name
  })
}

function extractKeyValue(
  properties: NodePath<t.ObjectProperty>[]
): string | null {
  const prop = findProperty(properties, 'key')
  if (prop) {
    const keyPath = prop.get('key')
    if (!Array.isArray(keyPath) && keyPath.node.name === 'key') {
      const valuePath = prop.get('value')
      const value = valuePath.evaluate().value
      return value
    }
  }
  return null
}

// add automatic ID to intl.formatMessage calls
// eslint-disable-next-line max-lines-per-function
export function addIdToFormatMessage(
  path: NodePath<t.CallExpression>,
  state: State
) {
  if (!isFormatMessageCall(path, state)) {
    // skip path if this is not intl.formatMessage call
    return
  }

  // intl.formatMessage first argument is the one which we would like to modify
  const arg0 = path.get('arguments.0') as NodePath<t.ObjectExpression>

  const properties = getObjectProperties(arg0)
  // blog(properties)

  // at least defaultMessage property is required to do anything useful
  if (!properties) {
    return
  }

  // if "id" property is already added by a developer or by this script just skip this node
  if (findProperty(properties, 'id')) {
    return
  }

  const keyValue = extractKeyValue(properties)

  const defaultMessageProp = findProperty(properties, 'defaultMessage')
  if (defaultMessageProp) {
    // try to statically evaluate defaultMessage to generate hash
    const evaluated = defaultMessageProp.get('value').evaluate()

    if (!evaluated.confident || typeof evaluated.value !== 'string') {
      throw defaultMessageProp
        .get('value')
        .buildCodeFrameError(
          '[React Intl Auto] defaultMessage must be statically evaluate-able for extraction.'
        )
    }

    const id = getPrefix(
      state,
      state.opts.useKey && keyValue ? keyValue : createHash(evaluated.value)
    )

    defaultMessageProp.insertAfter(objectProperty('id', id))

    // Remove defaultMessage prop if configured
    if (state.opts.removeDefaultMessage) {
      defaultMessageProp.remove()
    }
  }
}
