import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LogOut, Users, Send, Globe } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useToast } from '@/hooks/use-toast'

interface ChatInterfaceProps {
  username: string
  group: string
  language: string
  onLeaveGroup: () => void
}

export const ChatInterface = ({ username, group, language, onLeaveGroup }: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('')
  const [groupId, setGroupId] = useState<string | null>(null)
  const [translatingMessages, setTranslatingMessages] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleTranslationStart = (messageId: string) => {
    setTranslatingMessages(prev => new Set(prev).add(messageId))
  }

  const handleTranslationEnd = (messageId: string) => {
    setTranslatingMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(messageId)
      return newSet
    })
  }

  const { messages, onlineUsers, isLoading, joinGroup, leaveGroup, sendMessage } = useChat(
    groupId, 
    username, 
    language,
    handleTranslationStart,
    handleTranslationEnd
  )


  // Join group on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const id = await joinGroup(group)
        setGroupId(id)
      } catch (error) {
        console.error('Failed to join group:', error)
        toast({
          title: "Error",
          description: "Failed to join chat group",
          variant: "destructive",
        })
      }
    }

    initializeChat()
  }, [group, joinGroup, toast])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = () => {
    if (newMessage.trim() && groupId) {
      sendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleLeaveGroup = async () => {
    await leaveGroup()
    onLeaveGroup()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Joining chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 shadow-elegant">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">#{group}</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Globe className="h-3 w-3 mr-1" />
              {language.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{onlineUsers.length} online</span>
              <div className="flex -space-x-1">
                {onlineUsers.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {onlineUsers.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">+{onlineUsers.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleLeaveGroup}
              className="bg-destructive/10 hover:bg-destructive/20 border-destructive/30 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            // For system messages, always show original text
            if (message.message_type === 'system') {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-sm text-muted-foreground">
                    <span>{message.original_text}</span>
                  </div>
                </div>
              )
            }

            // For user messages, show translated text if available and different language
            const shouldShowTranslation = message.language !== language && 
                                        message.translated_texts && 
                                        typeof message.translated_texts === 'object' &&
                                        message.translated_texts[language]
            
            const isTranslating = message.language !== language && 
                                translatingMessages.has(message.id) &&
                                !shouldShowTranslation
            
            const displayText = shouldShowTranslation 
              ? message.translated_texts[language] 
              : message.original_text

            console.log('Rendering message:', {
              messageId: message.id,
              originalLang: message.language,
              userLang: language,
              shouldShowTranslation,
              isTranslating,
              translatedTexts: message.translated_texts,
              displayText,
              hasTranslationForUserLang: message.translated_texts?.[language] ? true : false
            })

            return (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {message.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {message.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                      {message.language !== language && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          <Globe className="h-3 w-3 mr-1" />
                          {message.language}
                        </Badge>
                      )}
                      {shouldShowTranslation && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">
                          Translated
                        </Badge>
                      )}
                      {isTranslating && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 bg-orange-50 text-orange-600 border-orange-200">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            Translating...
                          </div>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="bg-card border rounded-lg p-3 shadow-sm">
                      <p className="text-sm leading-relaxed">
                        {displayText}
                      </p>
                      {shouldShowTranslation && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Show original ({message.language})
                          </summary>
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {message.original_text}
                          </p>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <Card className="rounded-none border-x-0 border-b-0 shadow-elegant">
        <div className="flex gap-2 p-4">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}