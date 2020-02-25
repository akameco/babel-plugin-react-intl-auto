import { relative, dirname, sep } from 'path'
import { State } from '../types'
import { dotPath } from '.'

const escapeRegExp = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/gu, '\\$&')
}

const dotPathReplace = (
  fomatted: string,
  removePrefix: string,
  separator?: string
) => {
  const exp = `^${removePrefix.replace(/\//gu, '')}\\${dotPath(
    sep,
    separator
  )}?`
  let reg: RegExp

  // certain separators can throw an error and need to be escaped
  // e.g. "_"
  try {
    reg = new RegExp(exp, 'u')
  } catch (error) {
    reg = new RegExp(escapeRegExp(exp), 'u')
  }

  return dotPath(fomatted, separator).replace(reg, '')
}

export const getPrefix = (
  {
    file: {
      opts: { filename },
    },
    opts: { removePrefix, filebase = false, separator, relativeTo },
  }: State,
  exportName: string | null
) => {
  if (removePrefix === true) {
    return exportName === null ? '' : exportName
  }
  const file = relative(relativeTo || process.cwd(), filename)
  const fomatted = filebase ? file.replace(/\..+$/u, '') : dirname(file)
  removePrefix =
    removePrefix === undefined || removePrefix === false ? '' : removePrefix

  const fixed =
    removePrefix instanceof RegExp
      ? dotPath(fomatted.replace(removePrefix, ''), separator)
      : dotPathReplace(fomatted, removePrefix, separator)

  if (exportName === null) {
    return fixed
  }

  if (fixed === '') {
    return exportName
  }

  return `${fixed}.${exportName}`
}
