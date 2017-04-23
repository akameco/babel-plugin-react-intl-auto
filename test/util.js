import path from 'path'
import { transformFileSync } from 'babel-core'
import plugin from '../src'

const testPlugin = (filePath, opts = {}) => {
  const { code } = transformFileSync(filePath, {
    plugins: [[plugin, opts]]
  })
  return code
}

export default function macro(t, filePath, opts) {
  const x = testPlugin(path.join(filePath, 'actual.js'), opts)
  t.snapshot(x)
}
