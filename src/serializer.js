// @flow weak
export function getSnapshotSerializer() {
  return {
    // eslint-disable-next-line flowtype/no-weak-types
    test(value: any): boolean {
      return typeof value === 'string'
    },
    // eslint-disable-next-line flowtype/no-weak-types
    print(value: any): string {
      return value
    },
  }
}
