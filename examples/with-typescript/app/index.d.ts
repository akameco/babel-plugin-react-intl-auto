declare module '*.json' {
  interface Translation {
    [key: string]: {}
  }

  const Translation: Translation
  export default Translation
}
