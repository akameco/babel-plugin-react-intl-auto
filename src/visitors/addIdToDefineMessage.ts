import { join } from 'path'
import { NodePath } from '@babel/core'
import * as t from '@babel/types'
import { State } from '../types'
import {
  dotPath,
  objectProperty,
  getObjectProperties,
  createHash,
} from '../utils'
import { isImportLocalName } from '../utils/isImportLocalName'
import { getPrefix } from '../utils/getPrefix'
// import blog from 'babel-log'

const getId = (path: NodePath, prefix: string, separator?: string) => {
  let name

  if (path.isStringLiteral()) {
    name = path.node.value
  } else if (path.isIdentifier()) {
    name = path.node.name
  }

  if (!name) {
    throw new Error(`requires Object key or string literal`)
  }

  return dotPath(join(prefix, name), separator)
}

const getLeadingComment = (prop: NodePath) => {
  const commentNodes = prop.node.leadingComments
  return commentNodes
    ? commentNodes.map((node) => node.value.trim()).join('\n')
    : null
}

// eslint-disable-next-line max-lines-per-function,max-statements
const replaceProperties = (
  properties: NodePath<t.ObjectProperty>[],
  state: State,
  exportName: string | null
) => {
  const prefix = getPrefix(state, exportName)
  const {
    opts: { separator, includeDescription },
  } = state

  for (const prop of properties) {
    const objectValuePath = prop.get('value')
    const objectKeyPath = prop.get('key')
    if (Array.isArray(objectKeyPath)) {
      return
    }

    const messageDescriptorProperties: t.ObjectProperty[] = []

    // { defaultMessage: 'hello', description: 'this is hello' }
    if (objectValuePath.isObjectExpression()) {
      const objProps = objectValuePath.get('properties') as NodePath<
        t.ObjectProperty
      >[]

      // { id: 'already has id', defaultMessage: 'hello' }
      const isNotHaveId = objProps.every((v) => {
        const keyPath = v.get('key')
        return !Array.isArray(keyPath) && keyPath.node.name !== 'id'
      })

      const isNotHaveDescription = objProps.every(v => {
        const keyPath = v.get('key')
        return !Array.isArray(keyPath) && keyPath.node.name !== 'description'
      })

      if (isNotHaveId) {
        if (isNotHaveDescription || !includeDescription) {
          const id = getId(objectKeyPath, prefix, separator)
          messageDescriptorProperties.push(objectProperty('id', id))
        } else {
          const keyPathDefaultMessage = objProps.find(v => {
            const keyPath = v.get('key')
            return (
              !Array.isArray(keyPath) && keyPath.node.name === 'defaultMessage'
            )
          })
          const keyPathDescription = objProps.find(v => {
            const keyPath = v.get('key')
            return (
              !Array.isArray(keyPath) && keyPath.node.name === 'description'
            )
          })
          const id = dotPath(
            join(
              prefix,
              createHash(
                [
                  keyPathDefaultMessage
                    ? keyPathDefaultMessage.node.value.value
                    : '',
                  keyPathDescription ? keyPathDescription.node.value.value : '',
                ].join('')
              )
            ),
            separator
          )
          messageDescriptorProperties.push(objectProperty('id', id))
        }
      }

      messageDescriptorProperties.push(...objProps.map((v) => v.node))
    } else if (
      objectValuePath.isStringLiteral() ||
      objectValuePath.isTemplateLiteral()
    ) {
      // 'hello' or `hello ${user}`
      const id = getId(objectKeyPath, prefix, separator)

      messageDescriptorProperties.push(
        objectProperty('id', id),
        objectProperty('defaultMessage', objectValuePath.node)
      )
    } else {
      const evaluated = prop.get('value').evaluate()
      if (evaluated.confident && typeof evaluated.value === 'string') {
        const id = dotPath(join(prefix, evaluated.value), separator)

        messageDescriptorProperties.push(
          objectProperty('id', id),
          objectProperty('defaultMessage', evaluated.value)
        )
      }
    }

    const { extractComments = true } = state.opts

    if (extractComments) {
      const hasDescription = messageDescriptorProperties.find(
        (v) => v.key.name === 'description'
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
    objectValuePath.replaceWith(t.objectExpression(messageDescriptorProperties))
  }
}

const getExportName = (
  path: NodePath<t.CallExpression>,
  includeExportName: boolean | 'all' | undefined
): string | null => {
  const namedExport = path.findParent((v) => v.isExportNamedDeclaration())
  const defaultExport = path.findParent((v) => v.isExportDefaultDeclaration())

  if (includeExportName && namedExport) {
    const idPath = namedExport.get('declaration.declarations.0.id') as NodePath<
      t.Identifier
    >
    return idPath.node.name
  }

  if (includeExportName === 'all' && defaultExport) {
    return 'default'
  }

  return null
}

const isDefineMessagesCall = (
  path: NodePath<t.CallExpression>,
  state: State
): boolean => {
  /**
  Path "Identifier"
  name: "defineMessages"
  */
  const callee = path.get('callee')

  return (
    callee.isIdentifier() &&
    isImportLocalName(callee.node.name, ['defineMessages'], state)
  )
}

export function addIdToDefineMessage(
  path: NodePath<t.CallExpression>,
  state: State
) {
  if (state.file.opts.filename.includes('node_modules')){
    return
  }

  if (!isDefineMessagesCall(path, state)) {
    return
  }

  if (!path.get('arguments.0')) {
    return
  }

  const argPath = path.get('arguments.0') as NodePath<
    t.ObjectExpression | t.NumericLiteral | t.Identifier
  >

  const properties = getObjectProperties(argPath)

  if (!properties) {
    return
  }

  const exportName = getExportName(path, state.opts.includeExportName || false)
  replaceProperties(properties, state, exportName)
}
