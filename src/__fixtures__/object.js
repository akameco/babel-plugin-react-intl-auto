import { defineMessages } from 'react-intl'

defineMessages({
  hello: 'hello',
  new: {
    id: 'this is id',
    defaultMessage: 'id',
  },
  world: {
    defaultMessage: 'world',
  },
  headerTitle: {
    defaultMessage: 'Welcome to dashboard {name}!',
    description: 'Message to greet the user.',
  },
})
