import { PluginObj } from '@babel/core'
import { State } from './types'
import { visitJSXElement } from './visitors/jsx'
import { addIdToDefineMessage } from './visitors/addIdToDefineMessage'
import { addIdToFormatMessage } from './visitors/addIdToFormatMessage'

export default function () {
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
