import React, { useState } from 'react'
import { MessageCircle, Users, Globe, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSelect } from '@/components/ui/language-select'

interface LandingPageProps {
  onJoinChat: (username: string, group: string, language: string) => void
}

export function LandingPage({ onJoinChat }: LandingPageProps) {
  const [username, setUsername] = useState('')
  const [group, setGroup] = useState('')
  const [language, setLanguage] = useState('en')

  const handleJoin = () => {
    if (username.trim() && group.trim()) {
      onJoinChat(username.trim(), group.trim(), language)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-medium">
            <MessageCircle className="h-8 w-8 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            WhisperBridge
            <Sparkles className="h-6 w-6 text-primary" />
          </h1>
          
          <p className="text-muted-foreground text-lg">
            Real-time chat with instant translation
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4 text-primary" />
            Real-time messaging
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4 text-accent" />
            Auto translation
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-success" />
            Group chat
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-warning" />
            Dark theme
          </div>
        </div>

        {/* Join Form */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-foreground">Join a Group</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to start chatting
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Group Name</label>
              <Input
                placeholder="Enter group name"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Language</label>
              <LanguageSelect
                value={language}
                onValueChange={setLanguage}
              />
            </div>

            <Button
              onClick={handleJoin}
              disabled={!username.trim() || !group.trim()}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-soft transition-all duration-200 hover:shadow-medium"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Join Chat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Messages are automatically translated to your preferred language
        </p>
      </div>
    </div>
  )
}