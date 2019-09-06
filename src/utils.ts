import path from 'path'
import murmur from 'murmurhash3js'

const REG = new RegExp(`\\${path.sep}`, 'gu')

export const createHash = (message: string) => `${murmur.x86.hash32(message)}`

export const dotPath = (str: string) => str.replace(REG, '.')
