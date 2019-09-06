// eslint-disable-next-line import/no-extraneous-dependencies
import pluginTester from 'babel-plugin-tester'
import { Opts } from '../types'
import plugin from '..'

export function cases(
  filename: string,
  testCases: {
    title: string
    tests: { title: string; code: string }[]
    pluginOptions?: Opts
  }[]
) {
  const defaultOpts = {
    title: '',
    plugin,
    snapshot: true,
    babelOptions: { filename, parserOpts: { plugins: ['jsx'] } },
    tests: [],
  }

  for (const testCase of testCases) {
    testCase.tests = testCase.tests.map(t => ({ ...t, title: t.title }))
    pluginTester({ ...defaultOpts, ...testCase })
  }
}
