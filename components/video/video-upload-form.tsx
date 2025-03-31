"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileVideo } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import analyticsTracker from "@/lib/analytics"

export default function VideoUploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    sourceUrl: "",
    isPublic: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Start analytics tracking
  useEffect(() => {
    analyticsTracker.startSession("video")

    return () => {
      analyticsTracker.endSession()
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file (MP4, WebM, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video must be less than 100MB",
          variant: "destructive",
        })
        return
      }

      setVideoFile(file)
      analyticsTracker.recordAction()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVideoData((prev) => ({ ...prev, [name]: value }))
  }

  const removeFile = () => {
    setVideoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile && !videoData.sourceUrl) {
      toast({
        title: "Missing content",
        description: "Please upload a video file or provide a source URL",
        variant: "destructive",
      })
      return
    }

    if (!videoData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the video",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    analyticsTracker.recordAction()

    try {
      let filePath = ""

      // If we have a file, upload it first
      if (videoFile) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 5
          })
        }, 500)

        const formData = new FormData()
        formData.append("file", videoFile)
        formData.append("type", "video")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload video")
        }

        const uploadData = await uploadResponse.json()
        clearInterval(progressInterval)
        setUploadProgress(95)

        filePath = uploadData.filePath
      }

      // Then create the video record
      const createResponse = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: videoData.title,
          description: videoData.description,
          filePath: filePath,
          sourceUrl: videoData.sourceUrl,
          isPublic: videoData.isPublic,
        }),
      })

      if (!createResponse.ok) {
        throw new Error("Failed to save video data")
      }

      setUploadProgress(100)

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      })

      // Reset form
      setTimeout(() => {
        setVideoFile(null)
        setVideoData({
          title: "",
          description: "",
          sourceUrl: "",
          isPublic: true,
        })
        setUploadProgress(0)
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 1000)
    } catch (error) {
      console.error("Error uploading video:", error)
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
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
        <h2 className="text-xl font-semibold">Upload Video</h2>
        <p className="text-sm text-muted-foreground">Share educational videos with your peers and students.</p>
      </div>

      <Card className="bg-background/80 backdrop-blur-sm border">
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
                className="bg-background/80 backdrop-blur-sm border"
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
                className="bg-background/80 backdrop-blur-sm border"
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
                className="bg-background/80 backdrop-blur-sm border"
              />
              <p className="text-xs text-muted-foreground">
                If you're not uploading a file, provide a URL to the video source (YouTube, Vimeo, etc.)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="isPublic" className="flex items-center space-x-2 cursor-pointer">
                <input
                  title="Make this video public"
                  type="checkbox"
                  id="isPublic"
                  checked={videoData.isPublic}
                  onChange={(e) => setVideoData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>Make this video public</span>
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Upload Video File</Label>
              {!videoFile ? (
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                  <FileVideo className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your video file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supports MP4, WebM, and other common video formats up to 100MB
                  </p>
                  <Input
                    id="video-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
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
                    Select Video
                  </Button>
                </div>
              ) : (
                <motion.div
                  className="border rounded-md p-4 bg-background/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              )}
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
                disabled={isUploading || (!videoFile && !videoData.sourceUrl)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {isUploading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

