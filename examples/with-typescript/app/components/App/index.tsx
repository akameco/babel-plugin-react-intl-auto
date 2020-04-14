import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import Greeting from '../Greeting'
import messages from './messages'

export default function App() {
  const intl = useIntl()
  const user = {
    name: 'Eric',
    unreadCount: 4,
    lastLoginTime: Date.now() - 1000 * 60 * 60 * 24,
  }

  return (
    <div>
      <FormattedMessage {...messages.hello} />
      {intl.formatMessage({ defaultMessage: 'world' })}
      <Greeting user={user} />
    </div>
  )
}
