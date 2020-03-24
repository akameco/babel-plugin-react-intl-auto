import * as React from 'react'
import {
  FormattedMessage,
  FormattedNumber,
  FormattedRelativeTime,
} from 'react-intl'
import messages from './messages'

interface User {
  name: string
  unreadCount: number
  lastLoginTime: number
}

interface UserProps {
  user: User
}

export default function Greeting({ user }: UserProps) {
  return (
    <p>
      <FormattedMessage
        {...messages.welcome}
        values={{
          name: <b>{user.name}</b>,
          unreadCount: user.unreadCount,
          formattedUnreadCount: (
            <b>
              <FormattedNumber value={user.unreadCount} />
            </b>
          ),
          formattedLastLoginTime: (
            <FormattedRelativeTime value={user.lastLoginTime} />
          ),
        }}
      />
    </p>
  )
}
