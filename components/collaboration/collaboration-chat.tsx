"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"

interface User {
  id: string
  name: string
  avatar: string
  color: string
}

interface Message {
  id: string
  userId: string
  text: string
  timestamp: Date
}

interface CollaborationChatProps {
  currentUser: User
  collaborator: User
  isCollaboratorConnected: boolean
}

export default function CollaborationChat({
  currentUser,
  collaborator,
  isCollaboratorConnected,
}: CollaborationChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Simulate initial message
  useEffect(() => {
    if (isCollaboratorConnected) {
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        userId: collaborator.id,
        text: "Hi there! I'm ready to collaborate on this document.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, initialMessage])

      // Simulate collaborator messages
      const messageInterval = setInterval(() => {
        const randomMessages = [
          "What do you think about this section?",
          "I think we should add more details here.",
          "Let me know if you want to change anything.",
          "This looks good to me!",
          "Should we add a conclusion?",
        ]

        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)]

        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          userId: collaborator.id,
          text: randomMessage,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, newMessage])
      }, 45000) // Every 45 seconds

      return () => clearInterval(messageInterval)
    }
  }, [isCollaboratorConnected, collaborator.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      text: newMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="w-full lg:w-80">
      <CardContent className="p-4">
        <div className="flex flex-col h-[500px]">
          <div className="text-lg font-semibold mb-2">Chat</div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground p-4">
                {isCollaboratorConnected
                  ? "No messages yet. Start the conversation!"
                  : "Waiting for collaborator to join..."}
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.userId === currentUser.id
                const user = isCurrentUser ? currentUser : collaborator

                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${
                            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.text}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={!isCollaboratorConnected}
            />
            <Button type="submit" size="icon" disabled={!isCollaboratorConnected || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

