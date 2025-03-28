"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileVideo } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function VideoUploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    sourceUrl: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVideoData((prev) => ({ ...prev, [name]: value }))
  }

  const removeFile = () => {
    setVideoFile(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile && !videoData.sourceUrl) {
      alert("Please upload a video file or provide a source URL")
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
          setVideoFile(null)
          setVideoData({
            title: "",
            description: "",
            sourceUrl: "",
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
        <h2 className="text-xl font-semibold">Upload Video</h2>
        <p className="text-sm text-muted-foreground">Share educational videos with your peers and students.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                name="title"
                value={videoData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={videoData.description}
                onChange={handleInputChange}
                placeholder="Describe what the video is about"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL (Optional)</Label>
              <Input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                value={videoData.sourceUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/video"
              />
              <p className="text-xs text-muted-foreground">
                If you're not uploading a file, provide a URL to the video source (YouTube, Vimeo, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Upload Video File</Label>
              {!videoFile ? (
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <FileVideo className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your video file here, or click to browse
                  </p>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("video-upload")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Video
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileVideo className="h-8 w-8 mr-2 text-primary" />
                      <div>
                        <p className="font-medium">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
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
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

