module.exports = {
  testEnvironment: 'node',
  snapshotSerializers: [
    require.resolve('string-snapshot-serializer/serializer.js'),
  ],
}
