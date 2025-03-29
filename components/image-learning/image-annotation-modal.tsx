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

interface Annotation {
  id: string
  x: number
  y: number
  text: string
  color: string
}

interface ImageAnnotationModalProps {
  image: {
    id: string
    title: string
    description: string
    category: string
    imageUrl: string
    uploadedBy: string
    uploadedAt: string
    annotations: Annotation[]
  }
  isOpen: boolean
  onClose: () => void
  isEditMode: boolean
}

export default function ImageAnnotationModal({ image, isOpen, onClose, isEditMode }: ImageAnnotationModalProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>(image.annotations)
  const [activeTab, setActiveTab] = useState<string>(isEditMode ? "edit" : "view")
  const [newAnnotation, setNewAnnotation] = useState<Omit<Annotation, "id"> | null>(null)
  const [annotationText, setAnnotationText] = useState("")
  const [annotationColor, setAnnotationColor] = useState("#ff0000")
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setActiveTab(isEditMode ? "edit" : "view")
  }, [isEditMode])

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (activeTab !== "edit") return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setNewAnnotation({ x, y, text: "", color: annotationColor })
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
  }

  const cancelAnnotation = () => {
    setNewAnnotation(null)
    setAnnotationText("")
  }

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id))
  }

  const saveAnnotations = () => {
    // In a real app, you would save the annotations to your backend here
    console.log("Saving annotations:", annotations)
    // Close the modal
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl overflow-auto">
        <DialogHeader>
          <DialogTitle>{image.title}</DialogTitle>
          <DialogDescription>
            {image.category} • Uploaded by {image.uploadedBy} on {image.uploadedAt}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="edit">Annotate</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-4">
            <div className="relative border rounded-md overflow-scroll">
              <img
                src={image.imageUrl || "/placeholder.svg"}
                alt={image.title}
                className="w-full object-contain max-h-[400px]"
              />

              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-help"
                  style={{
                    left: `${annotation.x - 12}px`,
                    top: `${annotation.y - 12}px`,
                    backgroundColor: annotation.color,
                  }}
                  title={annotation.text}
                >
                  {annotations.indexOf(annotation) + 1}
                </div>
              ))}
            </div>

            {annotations.length > 0 ? (
              <div className="space-y-4">
              <h3 className="font-medium text-lg">Annotations</h3>
              <div className="space-y-2 md:space-y-0 max-h-[200px] flex flex-col md:flex-row overflow-y-auto">
                {annotations.map((annotation, index) => (
                <div
                  key={annotation.id}
                  className="flex items-center gap-3 p-2 h-10 border rounded-lg md:mr-2 md:mb-2 groups"
                >
                  <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: annotation.color }}
                  >
                  {index + 1}
                  </div>
                  <p className="text-sm flex-1">{annotation.text}</p>
                </div>
                ))}
              </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No annotations have been added to this image yet.</p>
            )}
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative border rounded-md overflow-hidden">
                  <img
                    ref={imageRef}
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.title}
                    className="w-full object-contain max-h-[500px]"
                    onClick={handleImageClick}
                    style={{ cursor: activeTab === "edit" ? "crosshair" : "default" }}
                  />

                  {annotations.map((annotation, index) => (
                    <div
                      key={annotation.id}
                      className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold group"
                      style={{
                        left: `${annotation.x - 12}px`,
                        top: `${annotation.y - 12}px`,
                        backgroundColor: annotation.color,
                      }}
                    >
                      {index + 1}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteAnnotation(annotation.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {newAnnotation && (
                    <div
                      className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse"
                      style={{
                        left: `${newAnnotation.x - 12}px`,
                        top: `${newAnnotation.y - 12}px`,
                        backgroundColor: newAnnotation.color,
                      }}
                    >
                      +
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-2">Click on the image to add an annotation.</p>
              </div>

              <div className="w-64 space-y-4">
                <div className="space-y-2">
                  <Label>Annotation Color</Label>
                  <ColorPicker color={annotationColor} onChange={setAnnotationColor} />
                </div>

                {newAnnotation && (
                  <div className="space-y-2 border rounded-md p-3">
                    <Label htmlFor="annotation-text">Annotation Text</Label>
                    <Input
                      id="annotation-text"
                      value={annotationText}
                      onChange={(e) => setAnnotationText(e.target.value)}
                      placeholder="Enter annotation text"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={addAnnotation}
                        disabled={!annotationText.trim()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={cancelAnnotation}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium">Current Annotations</h3>
                  {annotations.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
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

                <Button variant="default" className="w-full" onClick={saveAnnotations}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Annotations
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

