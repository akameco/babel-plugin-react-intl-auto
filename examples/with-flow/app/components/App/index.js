// @flow
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Greeting from '../Greeting'
import messages from './messages'

export default class App extends Component<{}> {
  render() {
    const user = {
      name: 'Eric',
      unreadCount: 4,
      lastLoginTime: Date.now() - 1000 * 60 * 60 * 24,
    }

    return (
      <div>
        <FormattedMessage defaultMessage="hello" />
        <FormattedMessage {...messages.hello} />
        <Greeting user={user} />
      </div>
    )
  }
}
