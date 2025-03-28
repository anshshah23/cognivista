"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface VideoModalProps {
  video: {
    id: string
    title: string
    description: string
    sourceUrl: string
    uploadedBy: string
    uploadedAt: string
  }
  isOpen: boolean
  onClose: () => void
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{video.title}</DialogTitle>
          <DialogDescription>
            Uploaded by {video.uploadedBy} on {video.uploadedAt}
          </DialogDescription>
        </DialogHeader>

        <div className="aspect-video w-full bg-black">
          <iframe
            src={video.sourceUrl.replace("watch?v=", "embed/")}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>

        <div className="space-y-2">
          <p className="text-sm">{video.description}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(video.sourceUrl, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Original Source
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

