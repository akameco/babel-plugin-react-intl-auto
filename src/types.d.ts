declare module 'react-intl' {
  interface ExtractableMessage {
    [key: string]: string
  }

  export function defineMessages<T extends ExtractableMessage>(
    messages: T
  ): Messages
}
