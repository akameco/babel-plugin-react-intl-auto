import { NodePath } from '@babel/core'
import * as t from '@babel/types'
import { State } from '../types'

export const isImportLocalName = (
  name: string | null | undefined,
  allowedNames: string[],
  { file, opts: { moduleSourceName = 'react-intl' } }: State
) => {
  const isSearchedImportSpecifier = (specifier: NodePath<t.ModuleSpecifier>) =>
    specifier.isImportSpecifier() &&
    allowedNames.includes(specifier.node.imported.name) &&
    (!name || specifier.node.local.name === name)

  let isImported = false

  if (file && file.path) {
    file.path.traverse({
      ImportDeclaration: {
        exit(path) {
          isImported =
            path.node.source.value.includes(moduleSourceName) &&
            path
              .get('specifiers')
              .some(specifier => isSearchedImportSpecifier(specifier))

          if (isImported) {
            path.stop()
          }
        },
      },
    })
  }

  return isImported
}
