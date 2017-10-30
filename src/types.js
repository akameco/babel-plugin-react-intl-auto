// @flow
type File = {
  opts: {
    filename: string,
  },
  metadata: {
    modules: {
      imports: {
        find: Function,
      },
    },
  },
}

export type State = {
  file: File,
  opts: {
    removePrefix?: string,
    filebase?: boolean,
    includeExportName?: boolean | 'all',
    extractComments?: boolean,
  },
}
