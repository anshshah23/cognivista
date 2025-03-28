"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function ImageUploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState({
    title: "",
    description: "",
    category: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

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
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) {
      alert("Please upload an image file")
      return
    }

    // Simulate upload progress
    setIsUploading(true)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          // Reset form after successful upload
          setImageFile(null)
          setImagePreview(null)
          setImageData({
            title: "",
            description: "",
            category: "",
          })
          setUploadProgress(0)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Upload Image</h2>
        <p className="text-sm text-muted-foreground">Share educational images for annotation and learning.</p>
      </div>

      <Card>
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
                    rows={5}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Upload Image</Label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center h-64">
                    <Image className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2 text-center">
                      Drag and drop your image here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4 text-center">Supports JPG, PNG, GIF up to 10MB</p>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select Image
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-md p-2 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-background/80 z-10"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-64 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isUploading || !imageFile}>
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

