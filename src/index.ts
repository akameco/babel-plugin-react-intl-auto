import * as t from '@babel/types'
import { NodePath, PluginObj } from '@babel/core'
import { State } from './types'
import { isImportLocalName } from './isImportLocalName'
import { visitJSXElement } from './visitors/jsx'
import { addIdToDefineMessage } from './visitors/addIdToDefineMessage'
import { createHash, objectProperty, getObjectProperties } from './utils'
import { getPrefix } from './getPrefix'
// import blog from 'babel-log'

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

  const properties = getObjectProperties(arg0)
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
    if ((prop.get('key') as any).node.name === 'defaultMessage') {
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

export default function() {
  return {
    name: 'react-intl-auto',
    visitor: {
      JSXElement: visitJSXElement,
      CallExpression(path, state: State) {
        addIdToFormatMessage(path, state)
        addIdToDefineMessage(path, state)
      },
    },
  } as PluginObj
}
