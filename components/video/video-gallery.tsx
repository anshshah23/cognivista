"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Play, Trash2 } from "lucide-react"
import VideoModal from "@/components/video/video-modal"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Video {
  _id: string
  title: string
  description: string
  filePath: string
  sourceUrl: string
  thumbnail: string
  duration: string
  views: number
  user: {
    _id: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export default function VideoGallery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/videos")
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
      } else {
        throw new Error("Failed to fetch videos")
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const openVideoModal = (video: Video) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  const deleteVideo = async (id: string) => {
    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the video from the local state
        setVideos((prevVideos) => prevVideos.filter((video) => video._id !== id))

        toast({
          title: "Success",
          description: "Video deleted successfully",
        })
      } else {
        throw new Error("Failed to delete video")
      }
    } catch (error) {
      console.error("Error deleting video:", error)
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Video Gallery</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search videos..."
            className="pl-8 bg-background/80 backdrop-blur-sm border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative">
                <Skeleton className="w-full h-48" />
                <div className="absolute bottom-2 right-2">
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <Card className="bg-background/80 backdrop-blur-sm border">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">No videos found matching your search.</p>
            <Button
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden card-hover bg-background/80 backdrop-blur-sm border">
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg?height=180&width=320"}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                    {video.duration || "00:00"}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{video.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <span>{video.user.username}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    <span className="mx-1">•</span>
                    <span>{video.views} views</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      onClick={() => openVideoModal(video)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                    {video.sourceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-background/80 backdrop-blur-sm"
                        onClick={() => window.open(video.sourceUrl, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Source
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background/95 backdrop-blur-sm border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Video</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{video.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-background/80 backdrop-blur-sm">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteVideo(video._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedVideo && <VideoModal video={selectedVideo} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </motion.div>
  )
}

