"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, Copy, Check } from "lucide-react"
import CollaborationChat from "@/components/collaboration/collaboration-chat"

// Mock data for users
const currentUser = {
  id: "user1",
  name: "John Doe",
  avatar: "/placeholder.svg",
  color: "#4f46e5",
}

const collaborator = {
  id: "user2",
  name: "Jane Smith",
  avatar: "/placeholder.svg",
  color: "#10b981",
}

export default function CollaborationEditor() {
  const [sessionId, setSessionId] = useState(`session-${Math.random().toString(36).substring(2, 9)}`)
  const [isConnected, setIsConnected] = useState(false)
  const [isCollaboratorConnected, setIsCollaboratorConnected] = useState(false)
  const [documentContent, setDocumentContent] = useState("")
  const [cursorPosition, setCursorPosition] = useState({ user: currentUser, position: 0 })
  const [collaboratorCursor, setCollaboratorCursor] = useState({ user: collaborator, position: 0 })
  const [isCopied, setIsCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
          setCollaboratorCursor((prev) => ({ ...prev, position: randomPosition }))
        }
      }, 5000)

      return () => clearInterval(cursorInterval)
    }, 3000)

    return () => clearTimeout(timer)
  }, [documentContent])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocumentContent(e.target.value)

    // Update cursor position
    if (textareaRef.current) {
      setCursorPosition({
        user: currentUser,
        position: textareaRef.current.selectionStart,
      })
    }
  }

  const handleTextClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      setCursorPosition({
        user: currentUser,
        position: textareaRef.current.selectionStart,
      })
    }
  }

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Collaborative Document</h2>
          <p className="text-sm text-muted-foreground">Share the session ID with a peer to collaborate in real-time.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Input value={sessionId} readOnly className="pr-20 w-64" />
            <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full" onClick={copySessionId}>
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Button variant="outline">Join Session</Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <Tabs defaultValue="document" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="document">Document</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="document" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
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
                    className="min-h-[400px] resize-none font-mono"
                  />

                  {isCollaboratorConnected && documentContent && (
                    <div
                      className="absolute w-0.5 h-5 animate-pulse"
                      style={{
                        backgroundColor: collaborator.color,
                        left: `${getPositionOffset(documentContent, collaboratorCursor.position)}px`,
                        top: `${getPositionTop(documentContent, collaboratorCursor.position)}px`,
                      }}
                    />
                  )}
                </div>

                {isCollaboratorConnected && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                      <AvatarFallback>{collaborator.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{collaborator.name} is editing</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Card>
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

        <CollaborationChat
          currentUser={currentUser}
          collaborator={collaborator}
          isCollaboratorConnected={isCollaboratorConnected}
        />
      </div>
    </div>
  )
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

