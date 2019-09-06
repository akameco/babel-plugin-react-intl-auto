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

// add automatic ID to intl.formatMessage calls
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
  if (
    properties.find(arg => {
      const keyPath = arg.get('key')
      return !Array.isArray(keyPath) && keyPath.node.name === 'id'
    })
  ) {
    return
  }

  for (const prop of properties) {
    const keyPath = prop.get('key')
    if (!Array.isArray(keyPath) && keyPath.node.name === 'defaultMessage') {
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
