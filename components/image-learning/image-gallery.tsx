"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Pencil, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ImageAnnotationModal from "@/components/image-learning/image-annotation-modal"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
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

interface ImageItem {
  _id: string
  title: string
  description: string
  category: string
  filePath: string
  isPublic: boolean
  annotations: Annotation[]
  user: {
    _id: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export default function ImageGallery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Start analytics tracking
  useEffect(() => {
    analyticsTracker.startSession("image-learning")

    return () => {
      analyticsTracker.endSession()
    }
  }, [])

  // Fetch images from API
  useEffect(() => {
    fetchImages()
  }, [categoryFilter])

  const fetchImages = async () => {
    setIsLoading(true)
    try {
      let url = "/api/images"
      if (categoryFilter) {
        url += `?category=${encodeURIComponent(categoryFilter)}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      } else {
        throw new Error("Failed to fetch images")
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredImages = images.filter(
    (image) =>
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const openImageModal = (image: ImageItem, editMode: boolean) => {
    setSelectedImage(image)
    setIsEditMode(editMode)
    setIsModalOpen(true)
    analyticsTracker.recordAction()
  }

  const handleAnnotationSave = async (imageId: string, annotations: Annotation[]) => {
    try {
      const response = await fetch(`/api/images/${imageId}/annotations`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ annotations }),
      })

      if (response.ok) {
        // Update the image in the local state
        setImages((prevImages) => prevImages.map((img) => (img._id === imageId ? { ...img, annotations } : img)))

        if (selectedImage && selectedImage._id === imageId) {
          setSelectedImage({ ...selectedImage, annotations })
        }

        toast({
          title: "Success",
          description: "Annotations saved successfully",
        })
      } else {
        throw new Error("Failed to save annotations")
      }
    } catch (error) {
      console.error("Error saving annotations:", error)
      toast({
        title: "Error",
        description: "Failed to save annotations",
        variant: "destructive",
      })
    }
  }

  const deleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the image from the local state
        setImages((prevImages) => prevImages.filter((img) => img._id !== imageId))

        toast({
          title: "Success",
          description: "Image deleted successfully",
        })
      } else {
        throw new Error("Failed to delete image")
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <motion.div
        className="flex flex-col md:flex-row justify-between items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold">Image Gallery</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search images..."
            className="pl-8 bg-background/80 backdrop-blur-sm border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative h-48">
                <Skeleton className="h-full w-full" />
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
      ) : filteredImages.length === 0 ? (
        <Card className="bg-background/80 backdrop-blur-sm border">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">No images found matching your search.</p>
            <Button
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("")
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredImages.map((image, index) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden card-hover bg-background/80 backdrop-blur-sm border">
                <div className="relative h-48">
                  <img
                    src={image.filePath || "/placeholder.svg"}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {image.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{image.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{image.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <span>{image.user.username}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      onClick={() => openImageModal(image, false)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-background/80 backdrop-blur-sm"
                      onClick={() => openImageModal(image, true)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Annotate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {selectedImage && (
        <ImageAnnotationModal
          image={selectedImage}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isEditMode={isEditMode}
          onSave={handleAnnotationSave}
        />
      )}
    </div>
  )
}

