module.exports = {
  testEnvironment: 'node',
  snapshotSerializers: [
    require.resolve('string-snapshot-serializer/serializer'),
  ],
  modulePathIgnorePatterns: ['<rootDir>/lib'],
}
