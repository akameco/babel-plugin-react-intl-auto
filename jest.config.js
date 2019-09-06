module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  testEnvironment: 'node',
  snapshotSerializers: [
    require.resolve('string-snapshot-serializer/serializer'),
  ],
  modulePathIgnorePatterns: ['<rootDir>/lib'],
}
