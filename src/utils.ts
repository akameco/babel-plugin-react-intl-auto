import { sep } from 'path'
import * as t from '@babel/types'
import murmur from 'murmurhash3js'
import { NodePath } from '@babel/core'

const REG = new RegExp(`\\${sep}`, 'gu')

const isObjectProperties = (
  properties: NodePath[]
): properties is NodePath<t.ObjectProperty>[] =>
  properties.every(p => p.isObjectProperty())

export const createHash = (message: string) => `${murmur.x86.hash32(message)}`

export const dotPath = (str: string) => str.replace(REG, '.')

export const objectProperty = (
  key: string,
  value: string | t.StringLiteral | t.TemplateLiteral
) => {
  const valueNode = typeof value === 'string' ? t.stringLiteral(value) : value
  return t.objectProperty(t.stringLiteral(key), valueNode)
}

export function getObjectProperties(path: NodePath) {
  if (path.isObjectExpression()) {
    const properties = path.get('properties')
    if (isObjectProperties(properties)) {
      return properties
    }
  } else if (path.isIdentifier()) {
    const binding = path.scope.getBinding(path.node.name)
    if (!binding) {
      return null
    }
    const properties = binding.path.get('init.properties')
    if (Array.isArray(properties) && isObjectProperties(properties)) {
      return properties
    }
  }
  return null
}
