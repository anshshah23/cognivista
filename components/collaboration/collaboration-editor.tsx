"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, Copy, Check, Save, Share, List, Plus } from "lucide-react"
import CollaborationChat from "@/components/collaboration/collaboration-chat"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/authContext"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import analyticsTracker from "@/lib/analytics"

interface Collaborator {
  _id: string
  username: string
}

interface Session {
  _id: string
  sessionId: string
  title: string
  content: string
  owner: Collaborator
  participants: Collaborator[]
  lastActivity: string
  createdAt: string
}

export default function CollaborationEditor() {
  const [sessionId, setSessionId] = useState(`session-${Math.random().toString(36).substring(2, 9)}`)
  const [isConnected, setIsConnected] = useState(false)
  const [isCollaboratorConnected, setIsCollaboratorConnected] = useState(false)
  const [documentContent, setDocumentContent] = useState("")
  const [documentTitle, setDocumentTitle] = useState("Untitled Document")
  const [cursorPosition, setCursorPosition] = useState<{ user: { _id: any; username: any } | null; position: number }>({
    user: null,
    position: 0,
  })
  const [collaboratorCursor, setCollaboratorCursor] = useState<{ user: { _id: string; username: string } | null; position: number }>({
    user: null,
    position: 0,
  })
  const [isCopied, setIsCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sessionsList, setSessionsList] = useState<Session[]>([])
  const [showSessionsDialog, setShowSessionsDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Start analytics tracking
  useEffect(() => {
    analyticsTracker.startSession("collaboration")

    return () => {
      analyticsTracker.endSession()
    }
  }, [])

  // Simulate connection after a delay
  useEffect(() => {
    setIsConnected(true)

    // Simulate collaborator joining after a delay
    const timer = setTimeout(() => {
      setIsCollaboratorConnected(true)

      // Simulate collaborator cursor movements
      const cursorInterval = setInterval(() => {
        if (documentContent.length > 0) {
          const randomPosition = Math.floor(Math.random() * documentContent.length)
          setCollaboratorCursor((prev) => ({
            ...prev,
            user: { _id: "collaborator", username: "Jane Smith" },
            position: randomPosition,
          }))
        }
      }, 5000)

      return () => clearInterval(cursorInterval)
    }, 3000)

    return () => clearTimeout(timer)
  }, [documentContent])

  // Load sessions list
  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/collaboration")
      if (response.ok) {
        const data = await response.json()
        setSessionsList(data.sessions)
      } else {
        throw new Error("Failed to load sessions")
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load collaboration sessions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load a specific session
  const loadSession = async (sessionId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/collaboration/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentSession(data.session)
        setDocumentContent(data.session.content)
        setDocumentTitle(data.session.title)
        setSessionId(data.session.sessionId)
        setShowSessionsDialog(false)

        toast({
          title: "Success",
          description: "Collaboration session loaded",
        })
      } else {
        throw new Error("Failed to load session")
      }
    } catch (error) {
      console.error("Error loading session:", error)
      toast({
        title: "Error",
        description: "Failed to load collaboration session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new session
  const createSession = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: documentTitle,
          content: documentContent,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSession(data.session)
        setSessionId(data.session.sessionId)

        toast({
          title: "Success",
          description: "Collaboration session created",
        })
      } else {
        throw new Error("Failed to create session")
      }
    } catch (error) {
      console.error("Error creating session:", error)
      toast({
        title: "Error",
        description: "Failed to create collaboration session",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update an existing session
  const updateSession = async () => {
    if (!currentSession) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/collaboration/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: documentTitle,
          content: documentContent,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Collaboration session updated",
        })
      } else {
        throw new Error("Failed to update session")
      }
    } catch (error) {
      console.error("Error updating session:", error)
      toast({
        title: "Error",
        description: "Failed to update collaboration session",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Save the current session
  const saveSession = async () => {
    if (currentSession) {
      await updateSession()
    } else {
      await createSession()
    }
    analyticsTracker.recordAction()
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocumentContent(e.target.value)

    // Update cursor position
    if (textareaRef.current) {
      setCursorPosition({
        user: user ? { _id: user.id, username: user.username } : null,
        position: textareaRef.current.selectionStart,
      })
    }
    analyticsTracker.recordAction()
  }

  const handleTextClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      setCursorPosition({
        user: user ? { _id: user.id, username: user.username } : null,
        position: textareaRef.current.selectionStart,
      })
    }
  }

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Helper function to calculate cursor position offset
  function getPositionOffset(text: string, position: number): number {
    // This is a simplified calculation
    // In a real implementation, you would need to account for line wrapping, font metrics, etc.
    const charWidth = 8 // Approximate width of a character in pixels
    const lineBreaks = text.substring(0, position).split("\n")
    const currentLine = lineBreaks[lineBreaks.length - 1]
    return currentLine.length * charWidth
  }

  // Helper function to calculate cursor position top
  function getPositionTop(text: string, position: number): number {
    // This is a simplified calculation
    const lineHeight = 24 // Approximate height of a line in pixels
    const lineBreaks = text.substring(0, position).split("\n")
    return (lineBreaks.length - 1) * lineHeight
  }

  // Simple markdown formatter
  function formatMarkdown(text: string): string {
    // This is a very simplified markdown parser
    // In a real app, you would use a proper markdown library

    // Format headings
    let formatted = text.replace(/^# (.+)$/gm, "<h1>$1</h1>")
    formatted = formatted.replace(/^## (.+)$/gm, "<h2>$1</h2>")
    formatted = formatted.replace(/^### (.+)$/gm, "<h3>$1</h3>")

    // Format bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

    // Format italic
    formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>")

    // Format lists
    formatted = formatted.replace(/^- (.+)$/gm, "<li>$1</li>")

    // Format paragraphs
    formatted = formatted.replace(/^(?!<h|<li)(.+)$/gm, "<p>$1</p>")

    // Wrap lists
    formatted = formatted.replace(/(<li>.+<\/li>\n)+/g, "<ul>$&</ul>")

    // Replace newlines with breaks for remaining cases
    formatted = formatted.replace(/\n/g, "<br>")

    return formatted
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Input
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="max-w-xs font-medium text-lg bg-background/80 backdrop-blur-sm border"
              placeholder="Untitled Document"
            />
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
          </motion.div>
        </div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="relative">
            <Input value={sessionId} readOnly className="pr-20 w-64 bg-background/80 backdrop-blur-sm border" />
            <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full" onClick={copySessionId}>
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </div>

          <Dialog
            open={showSessionsDialog}
            onOpenChange={(open) => {
              setShowSessionsDialog(open)
              if (open) loadSessions()
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-background/80 backdrop-blur-sm border">
                <List className="h-4 w-4 mr-2" />
                Sessions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Collaboration Sessions</DialogTitle>
                <DialogDescription>Your recent collaboration sessions</DialogDescription>
              </DialogHeader>

              <div className="max-h-96 overflow-y-auto py-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sessionsList.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No sessions found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a new collaboration session to get started
                    </p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      onClick={() => setShowSessionsDialog(false)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Session
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {sessionsList.map((session) => (
                      <Card
                        key={session._id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 bg-background/80 backdrop-blur-sm"
                        onClick={() => loadSession(session.sessionId)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{session.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Created: {new Date(session.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Last activity: {new Date(session.lastActivity).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex -space-x-2">
                              <Avatar className="h-8 w-8 border-2 border-background">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {session.owner.username.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              {session.participants.slice(0, 2).map((participant) => (
                                <Avatar key={participant._id} className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className="bg-blue-500 text-white">
                                    {participant.username.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {session.participants.length > 2 && (
                                <Avatar className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className="bg-muted text-muted-foreground">
                                    +{session.participants.length - 2}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="default"
            onClick={saveSession}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <Button variant="outline" className="bg-background/80 backdrop-blur-sm border">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-background/80 backdrop-blur-sm border">
            <CardContent className="p-4">
              <Tabs defaultValue="document" className="w-full">
                <TabsList className="bg-background/50 backdrop-blur-sm border">
                  <TabsTrigger
                    value="document"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Document
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="document" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1 bg-background/80 backdrop-blur-sm">
                        <User className="h-3 w-3" />
                        {isConnected ? "Connected" : "Connecting..."}
                      </Badge>
                      <Badge
                        variant={isCollaboratorConnected ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" />
                        {isCollaboratorConnected ? "Collaborator Online" : "Waiting for collaborator..."}
                      </Badge>
                    </div>
                  </div>

                  <div className="relative border rounded-md">
                    <Textarea
                      ref={textareaRef}
                      value={documentContent}
                      onChange={handleTextChange}
                      onClick={handleTextClick}
                      placeholder="Start typing your document here..."
                      className="min-h-[400px] resize-none font-mono bg-background/80 backdrop-blur-sm"
                    />

                    {isCollaboratorConnected && documentContent && collaboratorCursor.user && (
                      <div
                        className="absolute w-0.5 h-5 animate-pulse"
                        style={{
                          backgroundColor: "#10b981",
                          left: `${getPositionOffset(documentContent, collaboratorCursor.position)}px`,
                          top: `${getPositionTop(documentContent, collaboratorCursor.position)}px`,
                        }}
                      />
                    )}
                  </div>

                  {isCollaboratorConnected && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          JS
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">Jane Smith is editing</span>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <Card className="bg-background/80 backdrop-blur-sm border">
                    <CardContent className="p-4 min-h-[400px] prose dark:prose-invert max-w-none">
                      {documentContent ? (
                        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(documentContent) }} />
                      ) : (
                        <p className="text-muted-foreground">No content to preview.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {user && (
            <CollaborationChat
              currentUser={{ id: user.id, name: user.username, avatar: "/placeholder.svg", color: "#4f46e5" }}
              collaborator={{ id: "user2", name: "Jane Smith", avatar: "/placeholder.svg", color: "#10b981" }}
              isCollaboratorConnected={isCollaboratorConnected}
              sessionId={sessionId}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

