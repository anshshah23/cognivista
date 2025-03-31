"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/whiteboard/color-picker"
import { Plus, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import analyticsTracker from "@/lib/analytics"

interface Annotation {
  id: string
  x: number
  y: number
  text: string
  color: string
  createdBy?: {
    _id: string
    username: string
  }
}

interface ImageAnnotationModalProps {
  image: {
    _id: string
    title: string
    description: string
    category: string
    filePath: string
    annotations: Annotation[]
  }
  isOpen: boolean
  onClose: () => void
  isEditMode: boolean
  onSave: (imageId: string, annotations: Annotation[]) => void
}

export default function ImageAnnotationModal({
  image,
  isOpen,
  onClose,
  isEditMode,
  onSave,
}: ImageAnnotationModalProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>(image.annotations || [])
  const [activeTab, setActiveTab] = useState<string>(isEditMode ? "edit" : "view")
  const [newAnnotation, setNewAnnotation] = useState<Omit<Annotation, "id"> | null>(null)
  const [annotationText, setAnnotationText] = useState("")
  const [annotationColor, setAnnotationColor] = useState("#ff0000")
  const [isSaving, setIsSaving] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const { toast } = useToast()

  // Update annotations when image changes
  useEffect(() => {
    setAnnotations(image.annotations || [])
  }, [image])

  // Update active tab when edit mode changes
  useEffect(() => {
    setActiveTab(isEditMode ? "edit" : "view")
  }, [isEditMode])

  // Record analytics when modal opens
  useEffect(() => {
    if (isOpen) {
      analyticsTracker.recordAction()
    }
  }, [isOpen])

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (activeTab !== "edit") return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setNewAnnotation({ x, y, text: "", color: annotationColor })
    analyticsTracker.recordAction()
  }

  const addAnnotation = () => {
    if (!newAnnotation || !annotationText.trim()) return

    const newAnnotationWithId: Annotation = {
      ...newAnnotation,
      id: `a${Date.now()}`,
      text: annotationText,
    }

    setAnnotations([...annotations, newAnnotationWithId])
    setNewAnnotation(null)
    setAnnotationText("")
    analyticsTracker.recordAction()
  }

  const cancelAnnotation = () => {
    setNewAnnotation(null)
    setAnnotationText("")
  }

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id))
    analyticsTracker.recordAction()
  }

  const saveAnnotations = async () => {
    setIsSaving(true)

    try {
      await onSave(image._id, annotations)
      setActiveTab("view")
    } catch (error) {
      console.error("Error saving annotations:", error)
      toast({
        title: "Error",
        description: "Failed to save annotations",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-sm border">
        <DialogHeader>
          <DialogTitle>{image.title}</DialogTitle>
          <DialogDescription>
            {image.category} • {image.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/80 backdrop-blur-sm border">
            <TabsTrigger value="view" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              View
            </TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              Annotate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            <div className="relative border rounded-md overflow-hidden bg-background/50 backdrop-blur-sm">
              <img
                src={image.filePath || "/placeholder.svg"}
                alt={image.title}
                className="w-full object-contain max-h-[500px]"
              />

              <AnimatePresence>
                {annotations.map((annotation) => (
                  <motion.div
                    key={annotation.id}
                    className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help"
                    style={{
                      left: `${annotation.x - 12}px`,
                      top: `${annotation.y - 12}px`,
                      backgroundColor: annotation.color,
                    }}
                    title={annotation.text}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {annotations.indexOf(annotation) + 1}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {annotations.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium">Annotations</h3>
                <div className="space-y-2">
                  {annotations.map((annotation, index) => (
                    <motion.div
                      key={annotation.id}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: annotation.color }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm">{annotation.text}</p>
                        {annotation.createdBy && (
                          <p className="text-xs text-muted-foreground">Added by {annotation.createdBy.username}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No annotations have been added to this image yet.</p>
                <Button
                  className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  onClick={() => setActiveTab("edit")}
                >
                  Add Annotations
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative border rounded-md overflow-hidden bg-background/50 backdrop-blur-sm">
                  <img
                    ref={imageRef}
                    src={image.filePath || "/placeholder.svg"}
                    alt={image.title}
                    className="w-full object-contain max-h-[500px]"
                    onClick={handleImageClick}
                    style={{ cursor: activeTab === "edit" ? "crosshair" : "default" }}
                  />

                  <AnimatePresence>
                    {annotations.map((annotation, index) => (
                      <motion.div
                        key={annotation.id}
                        className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold group"
                        style={{
                          left: `${annotation.x - 12}px`,
                          top: `${annotation.y - 12}px`,
                          backgroundColor: annotation.color,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {index + 1}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteAnnotation(annotation.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}

                    {newAnnotation && (
                      <motion.div
                        className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse"
                        style={{
                          left: `${newAnnotation.x - 12}px`,
                          top: `${newAnnotation.y - 12}px`,
                          backgroundColor: newAnnotation.color,
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        +
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-sm text-muted-foreground mt-2">Click on the image to add an annotation.</p>
              </div>

              <div className="w-64 space-y-4">
                <div className="space-y-2">
                  <Label>Annotation Color</Label>
                  <ColorPicker color={annotationColor} onChange={setAnnotationColor} />
                </div>

                {newAnnotation && (
                  <motion.div
                    className="space-y-2 border rounded-md p-3 bg-background/80 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="annotation-text">Annotation Text</Label>
                    <Input
                      id="annotation-text"
                      value={annotationText}
                      onChange={(e) => setAnnotationText(e.target.value)}
                      placeholder="Enter annotation text"
                      className="bg-background/80 backdrop-blur-sm border"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        onClick={addAnnotation}
                        disabled={!annotationText.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-background/80 backdrop-blur-sm"
                        onClick={cancelAnnotation}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium">Current Annotations</h3>
                  {annotations.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {annotations.map((annotation, index) => (
                        <div key={annotation.id} className="flex items-start gap-2 group">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: annotation.color }}
                          >
                            {index + 1}
                          </div>
                          <p className="text-sm flex-1 truncate">{annotation.text}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteAnnotation(annotation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No annotations yet.</p>
                  )}
                </div>

                <Button
                  variant="default"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  onClick={saveAnnotations}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Annotations"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

