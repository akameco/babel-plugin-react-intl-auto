// @flow
import path from 'path'
import fs from 'fs'
import { transformFileSync } from 'babel-core'

import plugin from '../'

const testPlugin = (filePath, opts = {}) => {
  const { code } = transformFileSync(filePath, {
    plugins: [[plugin, opts]],
  })
  return code
}

describe('snapshot', () => {
  const rootPath = path.resolve(__dirname, '../__fixtures__')
  const files = fs.readdirSync(rootPath)

  for (const file of files) {
    test(`snapshot -- ${file}`, () => {
      const result = testPlugin(path.join(rootPath, file))
      expect(result).toMatchSnapshot()
    })

    test(`removePrefix -- ${file}`, () => {
      const result = testPlugin(path.join(rootPath, file), {
        removePrefix: 'src/',
      })
      expect(result).toMatchSnapshot()
    })

    test(`removePrefix:no-slash -- ${file}`, () => {
      const result = testPlugin(path.join(rootPath, file), {
        removePrefix: 'src',
      })
      expect(result).toMatchSnapshot()
    })

    test(`filebase = true -- ${file}`, () => {
      const result = testPlugin(path.join(rootPath, file), {
        filebase: true,
      })
      expect(result).toMatchSnapshot()
    })

    test(`filebase = false -- ${file}`, () => {
      const result = testPlugin(path.join(rootPath, file), {
        filebase: false,
      })
      expect(result).toMatchSnapshot()
    })

    test(`includeExportName = true -- ${file}`, () => {
      const result = testPlugin(path.join(rootPath, file), {
        includeExportName: true,
      })
      expect(result).toMatchSnapshot()
    })

    test(`includeExportName = all -- ${file}`, () => {
      const result = testPlugin(path.join(rootPath, file), {
        includeExportName: 'all',
      })
      expect(result).toMatchSnapshot()
    })
  }
})
