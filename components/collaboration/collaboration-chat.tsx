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
  sessionId: string
  documentContent?: string
  sessionExists?: boolean
  onDocumentUpdate?: (newContent: string) => void
}

export default function CollaborationChat({
  currentUser,
  sessionId,
  documentContent = "",
  sessionExists = false,
  onDocumentUpdate,
}: CollaborationChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiUsage, setAiUsage] = useState({ used: 0, remaining: 3, limit: 3 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Fetch initial data and setup polling
  useEffect(() => {
    if (sessionExists && sessionId && sessionId.startsWith('collab-')) {
      fetchMessages()
      fetchAiUsage()

      // Poll for new messages every 10 seconds
      const pollInterval = setInterval(() => {
        fetchMessages()
      }, 10000)

      return () => clearInterval(pollInterval)
    }
  }, [sessionId, sessionExists])

  // Fetch AI usage limits
  const fetchAiUsage = async () => {
    try {
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/ai-helper`)
      if (response.ok) {
        const data = await response.json()
        setAiUsage(data)
      }
    } catch (error) {
      console.error("Error fetching AI usage:", error)
    }
  }

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/collaboration/sessions/${sessionId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else if (response.status === 404) {
        // Session doesn't exist yet - user needs to save first
        console.log("Session not found - save the document first")
      } else {
        console.error("Failed to fetch messages")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }



  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !currentUser) return

    if (!sessionExists) {
      toast({
        title: "Session not saved",
        description: "Please save your document first before sending messages.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if message mentions @Helper
      const isHelperRequest = newMessage.toLowerCase().includes("@helper")

      if (isHelperRequest) {
        // Check AI usage limit
        if (aiUsage.remaining <= 0) {
          toast({
            title: "Daily limit reached",
            description: "You've used all 3 AI assistance requests for today. Try again tomorrow.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        // Get document content from parent (would need to pass this as prop)
        // For now, we'll request AI help without document context
        const response = await fetch(`/api/collaboration/sessions/${sessionId}/ai-helper`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: newMessage.replace(/@helper/gi, "").trim(),
            documentContent: documentContent,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          
          // If AI updated the document, refresh the content in the editor
          if (data.documentUpdated && data.updatedContent && onDocumentUpdate) {
            onDocumentUpdate(data.updatedContent)
          }
          
          // Refresh messages to show AI response
          await fetchMessages()
          await fetchAiUsage()
          setNewMessage("")
          toast({
            title: "AI Assistant",
            description: `Response added to document. ${data.usage?.remaining || 0} requests remaining today.`,
          })
          analyticsTracker.recordAction()
        } else {
          const error = await response.json()
          throw new Error(error.error || "Failed to get AI response")
        }
      } else {
        // Send regular message to API
        const response = await fetch(`/api/collaboration/sessions/${sessionId}/messages`, {
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
          // Add message to local state
          setMessages((prev) => [...prev, data.chatMessage])
          setNewMessage("")
          analyticsTracker.recordAction()
        } else {
          throw new Error("Failed to send message")
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
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
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-semibold">Chat</div>
            <div className="text-xs text-muted-foreground">
              AI: {aiUsage.remaining}/{aiUsage.limit} left today
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground p-4">
                {sessionExists ? 
                  "No messages yet. Start the conversation!" : 
                  "Save your document first to enable chat"}
              </div>
            ) : (
              <AnimatePresence initial={false}>
  {messages.map((message, index) => {
    const isCurrentUser = message.userId === currentUser?.id
    const username = message.user?.username || currentUser?.name || 'Unknown'
    const userColor = isCurrentUser ? currentUser?.color : '#10b981'

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
            <AvatarFallback style={{ backgroundColor: userColor }} className="text-white">
              {username.substring(0, 2).toUpperCase()}
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
              placeholder={sessionExists ? "Type a message or @Helper for AI assistance..." : "Save document to enable chat..."}
              disabled={!currentUser || !sessionExists}
              className="bg-background/80 backdrop-blur-sm border"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || !currentUser || isLoading || !sessionExists}
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

