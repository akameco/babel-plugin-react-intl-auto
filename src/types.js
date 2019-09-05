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
  path: Object,
}

export type State = {
  file: File,
  opts: {
    removePrefix?: boolean | string,
    filebase?: boolean,
    includeExportName?: boolean | 'all',
    extractComments?: boolean,
    useKey?: boolean,
    moduleSourceName?: string,
  },
}
