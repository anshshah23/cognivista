"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import analyticsTracker from "@/lib/analytics"

interface VideoModalProps {
  video: {
    _id: string
    title: string
    description: string
    sourceUrl: string
    filePath: string
    user: {
      username: string
    }
    createdAt: string
  }
  isOpen: boolean
  onClose: () => void
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  const { toast } = useToast()

  // Record view when modal opens
  useEffect(() => {
    if (isOpen) {
      analyticsTracker.recordAction()

      // Record view in the backend
      const recordView = async () => {
        try {
          // This is a GET request that will increment the view count
          await fetch(`/api/videos/${video._id}`)
        } catch (error) {
          console.error("Error recording view:", error)
        }
      }

      recordView()
    }
  }, [isOpen, video._id])

  // Determine video source
  const getVideoSource = () => {
    if (video.filePath) {
      return video.filePath
    }

    if (video.sourceUrl) {
      // Convert YouTube watch URLs to embed URLs
      if (video.sourceUrl.includes("youtube.com/watch?v=")) {
        return video.sourceUrl.replace("watch?v=", "embed/")
      }

      // Convert YouTube short URLs
      if (video.sourceUrl.includes("youtu.be/")) {
        const videoId = video.sourceUrl.split("youtu.be/")[1]
        return `https://www.youtube.com/embed/${videoId}`
      }

      // Handle Vimeo URLs
      if (video.sourceUrl.includes("vimeo.com/")) {
        const videoId = video.sourceUrl.split("vimeo.com/")[1]
        return `https://player.vimeo.com/video/${videoId}`
      }

      return video.sourceUrl
    }

    return ""
  }

  const videoSource = getVideoSource()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-sm border">
        <DialogHeader>
          <DialogTitle>{video.title}</DialogTitle>
          <DialogDescription>
            Uploaded by {video.user.username} on {new Date(video.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
          {videoSource ? (
            video.filePath ? (
              <video
                src={videoSource}
                controls
                className="w-full h-full"
                autoPlay
                onError={() => {
                  toast({
                    title: "Error",
                    description: "Failed to load video. The file may be missing or corrupted.",
                    variant: "destructive",
                  })
                }}
              />
            ) : (
              <iframe
                src={videoSource}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No video source available
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm">{video.description}</p>
          {video.sourceUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(video.sourceUrl, "_blank")}
              className="bg-background/80 backdrop-blur-sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Original Source
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

