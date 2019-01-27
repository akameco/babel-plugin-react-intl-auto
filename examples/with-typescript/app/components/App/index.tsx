import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import Greeting from '../Greeting'
import messages from './messages'

export default class App extends React.Component<{}> {
  render() {
    const user = {
      name: 'Eric',
      unreadCount: 4,
      lastLoginTime: Date.now() - 1000 * 60 * 60 * 24,
    }

    return (
      <div>
        {/* Currently unavailable
          <FormattedMessage defaultMessage="hello" />
        */}
        <FormattedMessage {...messages.hello} />
        <Greeting user={user} />
      </div>
    )
  }
}
