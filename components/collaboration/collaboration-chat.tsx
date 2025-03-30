"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import analyticsTracker from "@/lib/analytics"

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
  user?: {
    username: string
  }
}

interface CollaborationChatProps {
  currentUser: User | null
  collaborator: User
  isCollaboratorConnected: boolean
  sessionId: string
}

export default function CollaborationChat({
  currentUser,
  collaborator,
  isCollaboratorConnected,
  sessionId,
}: CollaborationChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Fetch messages when session ID changes
  useEffect(() => {
    if (sessionId) {
      fetchMessages()
    }
  }, [sessionId])

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/collaboration/${sessionId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        console.error("Failed to fetch messages")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  // Simulate initial message from collaborator
  useEffect(() => {
    if (isCollaboratorConnected && messages.length === 0) {
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
  }, [isCollaboratorConnected, collaborator.id, messages.length])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !currentUser) return

    setIsLoading(true)

    try {
      // Send message to API
      const response = await fetch(`/api/collaboration/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newMessage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Add the message to the local state
        setMessages((prev) => [...prev, data.chatMessage])
        setNewMessage("")
        analyticsTracker.recordAction()
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="w-full lg:w-80 bg-background/80 backdrop-blur-sm border">
      <CardContent className="p-4">
        <div className="flex flex-col h-[500px]">
          <div className="text-lg font-semibold mb-2">Chat</div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground p-4">
                {isCollaboratorConnected
                  ? "No messages yet. Start the conversation!"
                  : "Waiting for collaborator to join..."}
              </div>
            ) : (
              <AnimatePresence initial={false}>
  {messages.map((message, index) => {
    const isCurrentUser = message.userId === currentUser?.id
    const user = isCurrentUser ? currentUser : collaborator
    const username = message.user?.username || user.name

    return (
      <motion.div
        key={`${message.id}-${index}`} // Ensure uniqueness by appending the index
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={username} />
            <AvatarFallback style={{ backgroundColor: user.color }} className="text-white">
              {username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                isCurrentUser ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-muted"
              }`}
            >
              {message.text}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</div>
          </div>
        </div>
      </motion.div>
    )
  })}
</AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={!isCollaboratorConnected || !currentUser}
              className="bg-background/80 backdrop-blur-sm border"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!isCollaboratorConnected || !newMessage.trim() || !currentUser || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

