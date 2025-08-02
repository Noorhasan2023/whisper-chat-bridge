import React, { useState } from 'react'
import { LandingPage } from '../components/landing-page'
import { ChatInterface } from '../components/chat-interface'

interface UserSession {
  username: string
  group: string
  language: string
}

const Index = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null)

  const handleJoinChat = (username: string, group: string, language: string) => {
    setUserSession({ username, group, language })
  }

  const handleLeaveGroup = () => {
    setUserSession(null)
  }

  if (userSession) {
    return (
      <ChatInterface
        username={userSession.username}
        group={userSession.group}
        language={userSession.language}
        onLeaveGroup={handleLeaveGroup}
      />
    )
  }

  return <LandingPage onJoinChat={handleJoinChat} />
}

export default Index