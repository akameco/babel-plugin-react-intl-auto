import { NodePath } from '@babel/core'
import * as t from '@babel/types'
import { State } from '../types'
import { createHash } from '../utils'
import { isImportLocalName } from '../utils/isImportLocalName'
import { getPrefix } from '../utils/getPrefix'
// import blog from 'babel-log'

// Process react-intl components
const REACT_COMPONENTS = ['FormattedMessage', 'FormattedHTMLMessage']

const getElementAttributePaths = (
  elementPath: NodePath<t.JSXOpeningElement>
) => {
  if (!elementPath) {
    return {}
  }

  const attributesPath = elementPath.get('attributes') as NodePath<
    t.JSXAttribute
  >[]

  const defaultMessagePath = attributesPath.find(
    attrPath =>
      attrPath.node.name && attrPath.node.name.name === 'defaultMessage'
  )

  const descriptionPath = attributesPath.find(
    attrPath => attrPath.node.name && attrPath.node.name.name === 'description'
  )

  const idPath = attributesPath.find(
    attrPath => attrPath.node.name && attrPath.node.name.name === 'id'
  )

  const keyPath = attributesPath.find(
    attrPath => attrPath.node.name && attrPath.node.name.name === 'key'
  )

  return {
    id: idPath,
    defaultMessage: defaultMessagePath,
    description: descriptionPath,
    key: keyPath,
  }
}

/**
Path "JSXAttribute"
  name: Node "JSXIdentifier"
    name: "defaultMessage"
  value: Node "StringLiteral"
    extra: Object {
      "raw": "\"hello\"",
      "rawValue": "hello",
    }
    value: "hello"
 */
const extractFromValuePath = (jsxAttributePath: NodePath<t.JSXAttribute>) => {
  // blog(jsxAttributePath)
  const valuePath = jsxAttributePath.get('value')
  if (!valuePath) {
    return null
  }
  /**
    Path "StringLiteral"
      extra: Object {
        "raw": "hello",
        "rawValue": "hello",
      }
      value: "hello"
    */
  if (valuePath.isStringLiteral()) {
    return valuePath.node.value
  }

  /**
  Path "JSXExpressionContainer"
  expression: Node "CallExpression"
    arguments: Array []
    callee: Node "Identifier"
      name: "getMsg"
  */
  if (valuePath.isJSXExpressionContainer()) {
    // Evaluate the message expression to see if it yields a string
    const evaluated = valuePath.get('expression').evaluate()
    /**
    Object {
      "confident": true,
      "deopt": null,
      "value": "variable message",
    }
     */
    if (evaluated.confident && typeof evaluated.value === 'string') {
      return evaluated.value
    }
    throw valuePath.buildCodeFrameError(
      `[React Intl Auto] ${
        jsxAttributePath.get('name').node.name
      } must be statically evaluate-able for extraction.`
    )
  }

  return null
}

const generateId = (
  defaultMessage: NodePath<t.JSXAttribute>,
  state: State,
  key: NodePath<t.JSXAttribute> | undefined,
  description: NodePath<t.JSXAttribute> | undefined
) => {
  // ID = path to the file + key
  let suffix = key && state.opts.useKey ? extractFromValuePath(key) : ''
  if (!suffix) {
    // ID = path to the file + hash of the defaultMessage
    const messageValue = extractFromValuePath(defaultMessage)
    // ID = path to the file + hash of the defaultMessage + description
    const descriptionValue =
      description && state.opts.includeDescription
        ? extractFromValuePath(description)
        : ''
    if (messageValue) {
      suffix = createHash([messageValue, descriptionValue].join(''))
    }
  }

  const prefix = getPrefix(state, suffix)

  // Insert an id attribute before the defaultMessage attribute
  defaultMessage.insertBefore(
    t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral(prefix))
  )
}

export const visitJSXElement = (path: NodePath, state: State) => {
  const jsxOpeningElement = path.get('openingElement') as NodePath<
    t.JSXOpeningElement
  >

  // Is this a react-intl component? Handles both:
  // import { FormattedMessage as T } from 'react-intl'
  // import { FormattedMessage } from 'react-intl'
  if (
    t.isJSXIdentifier(jsxOpeningElement.node.name) &&
    isImportLocalName(jsxOpeningElement.node.name.name, REACT_COMPONENTS, state)
  ) {
    // Get the attributes for the component
    const { id, defaultMessage, key, description } = getElementAttributePaths(
      jsxOpeningElement
    )

    // If valid message but missing ID, generate one
    if (!id && defaultMessage) {
      generateId(
        defaultMessage,
        state,
        state.opts.useKey ? key : undefined,
        description
      )
    }
  }
}
