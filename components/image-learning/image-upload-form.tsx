"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import analyticsTracker from "@/lib/analytics"

export default function ImageUploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState({
    title: "",
    description: "",
    category: "",
    isPublic: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 10MB",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      analyticsTracker.recordAction()

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setImageData((prev) => ({ ...prev, [name]: value }))
  }

  const removeFile = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    if (!imageData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the image",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    analyticsTracker.recordAction()

    try {
      // First upload the file
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("type", "image")

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image")
      }

      const uploadData = await uploadResponse.json()
      clearInterval(progressInterval)
      setUploadProgress(95)

      // Then create the image record
      const createResponse = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: imageData.title,
          description: imageData.description,
          category: imageData.category,
          filePath: uploadData.filePath,
          isPublic: imageData.isPublic,
        }),
      })

      if (!createResponse.ok) {
        throw new Error("Failed to save image data")
      }

      setUploadProgress(100)

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })

      // Reset form
      setTimeout(() => {
        setImageFile(null)
        setImagePreview(null)
        setImageData({
          title: "",
          description: "",
          category: "",
          isPublic: true,
        })
        setUploadProgress(0)
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 1000)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h2 className="text-xl font-semibold">Upload Image</h2>
        <p className="text-sm text-muted-foreground">Share educational images for annotation and learning.</p>
      </div>

      <Card className="bg-background/80 backdrop-blur-sm border">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Image Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={imageData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a descriptive title"
                    className="bg-background/80 backdrop-blur-sm border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={imageData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Biology, Chemistry, Art"
                    className="bg-background/80 backdrop-blur-sm border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={imageData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what the image shows and its educational value"
                    className="bg-background/80 backdrop-blur-sm border"
                    rows={5}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="isPublic" className="flex items-center space-x-2 cursor-pointer">
                    <input
                      title="Upload image"
                      type="checkbox"
                      id="isPublic"
                      checked={imageData.isPublic}
                      onChange={(e) => setImageData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span>Make this image public</span>
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Upload Image</Label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center h-64 bg-background/50 backdrop-blur-sm">
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2 text-center">
                      Drag and drop your image here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4 text-center">Supports JPG, PNG, GIF up to 10MB</p>
                    <Input
                      id="image-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-background/80 backdrop-blur-sm border"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select Image
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    className="border rounded-md p-2 relative bg-background/50 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-background/80 z-10 rounded-full"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-64 object-contain"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUploading || !imageFile}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

