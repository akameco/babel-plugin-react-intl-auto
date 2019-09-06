import { relative, dirname, sep } from 'path'
import { State } from './types'
import { dotPath } from './utils'

export const getPrefix = (
  {
    file: {
      opts: { filename },
    },
    opts: { removePrefix, filebase = false },
  }: State,
  exportName: string | null
) => {
  if (removePrefix === true) {
    return exportName === null ? '' : exportName
  }
  const file = relative(process.cwd(), filename)
  const fomatted = filebase ? file.replace(/\..+$/u, '') : dirname(file)
  removePrefix =
    removePrefix === undefined || removePrefix === false ? '' : removePrefix
  const fixed =
    removePrefix instanceof RegExp
      ? dotPath(fomatted.replace(removePrefix, ''))
      : dotPath(fomatted).replace(
          new RegExp(
            `^${removePrefix.replace(/\//gu, '')}\\${dotPath(sep)}?`,
            'u'
          ),

          ''
        )

  if (exportName === null) {
    return fixed
  }

  if (fixed === '') {
    return exportName
  }

  return `${fixed}.${exportName}`
}
