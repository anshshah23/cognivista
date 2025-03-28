"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Play } from "lucide-react"
import VideoModal from "@/components/video/video-modal"

// Mock data for videos
const mockVideos = [
  {
    id: "1",
    title: "Introduction to Mathematics",
    description: "Learn the basics of mathematics with this comprehensive introduction.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "15:30",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadedBy: "Professor Smith",
    uploadedAt: "2023-05-15",
  },
  {
    id: "2",
    title: "Physics Fundamentals",
    description: "Understand the core concepts of physics in this educational video.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "22:45",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadedBy: "Dr. Johnson",
    uploadedAt: "2023-06-20",
  },
  {
    id: "3",
    title: "Chemistry Lab Techniques",
    description: "Learn essential laboratory techniques for chemistry experiments.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "18:15",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadedBy: "Dr. Martinez",
    uploadedAt: "2023-07-10",
  },
  {
    id: "4",
    title: "Biology: Cell Structure",
    description: "Explore the structure and function of cells in this detailed video.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "25:10",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadedBy: "Professor Wilson",
    uploadedAt: "2023-08-05",
  },
  {
    id: "5",
    title: "Computer Science: Algorithms",
    description: "Learn about fundamental algorithms and their applications.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "30:45",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadedBy: "Dr. Chen",
    uploadedAt: "2023-09-12",
  },
  {
    id: "6",
    title: "History: Ancient Civilizations",
    description: "Discover the wonders of ancient civilizations around the world.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "28:20",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    uploadedBy: "Professor Adams",
    uploadedAt: "2023-10-18",
  },
]

export default function VideoGallery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<(typeof mockVideos)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredVideos = mockVideos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const openVideoModal = (video: (typeof mockVideos)[0]) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Video Gallery</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search videos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground">No videos found matching your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                  {video.duration}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{video.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{video.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <span>{video.uploadedBy}</span>
                  <span className="mx-1">•</span>
                  <span>{video.uploadedAt}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="default" size="sm" className="flex-1" onClick={() => openVideoModal(video)}>
                    <Play className="h-4 w-4 mr-1" />
                    Watch
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(video.sourceUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Source
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedVideo && <VideoModal video={selectedVideo} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}

