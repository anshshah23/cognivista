"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Pencil, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ImageAnnotationModal from "@/components/image-learning/image-annotation-modal"

// Mock data for images
const mockImages = [
  {
    id: "1",
    title: "Human Anatomy: Skeletal System",
    description: "Detailed diagram of the human skeletal system with labeled bones.",
    category: "Biology",
    imageUrl: "/placeholder.svg?height=400&width=600",
    uploadedBy: "Professor Smith",
    uploadedAt: "2023-05-15",
    annotations: [
      { id: "a1", x: 150, y: 100, text: "Skull", color: "#ff0000" },
      { id: "a2", x: 300, y: 200, text: "Ribcage", color: "#00ff00" },
      { id: "a3", x: 250, y: 350, text: "Femur", color: "#0000ff" },
    ],
  },
  {
    id: "2",
    title: "Cell Structure",
    description: "Diagram showing the structure of an animal cell with organelles.",
    category: "Biology",
    imageUrl: "/placeholder.svg?height=400&width=600",
    uploadedBy: "Dr. Johnson",
    uploadedAt: "2023-06-20",
    annotations: [
      { id: "a4", x: 200, y: 150, text: "Nucleus", color: "#ff0000" },
      { id: "a5", x: 300, y: 250, text: "Mitochondria", color: "#00ff00" },
    ],
  },
  {
    id: "3",
    title: "Periodic Table of Elements",
    description: "Complete periodic table with all chemical elements.",
    category: "Chemistry",
    imageUrl: "/placeholder.svg?height=400&width=600",
    uploadedBy: "Dr. Martinez",
    uploadedAt: "2023-07-10",
    annotations: [],
  },
  {
    id: "4",
    title: "World Map: Continents",
    description: "Political world map showing all continents and major countries.",
    category: "Geography",
    imageUrl: "/placeholder.svg?height=400&width=600",
    uploadedBy: "Professor Wilson",
    uploadedAt: "2023-08-05",
    annotations: [
      { id: "a6", x: 150, y: 200, text: "North America", color: "#ff0000" },
      { id: "a7", x: 350, y: 250, text: "Europe", color: "#00ff00" },
      { id: "a8", x: 450, y: 300, text: "Asia", color: "#0000ff" },
    ],
  },
  {
    id: "5",
    title: "Solar System",
    description: "Diagram of our solar system showing planets and their orbits.",
    category: "Astronomy",
    imageUrl: "/placeholder.svg?height=400&width=600",
    uploadedBy: "Dr. Chen",
    uploadedAt: "2023-09-12",
    annotations: [],
  },
  {
    id: "6",
    title: "Plant Cell Structure",
    description: "Detailed diagram of a plant cell with labeled parts.",
    category: "Biology",
    imageUrl: "/placeholder.svg?height=400&width=600",
    uploadedBy: "Professor Adams",
    uploadedAt: "2023-10-18",
    annotations: [],
  },
]

export default function ImageGallery() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImage, setSelectedImage] = useState<(typeof mockImages)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const filteredImages = mockImages.filter(
    (image) =>
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const openImageModal = (image: (typeof mockImages)[0], editMode: boolean) => {
    setSelectedImage(image)
    setIsEditMode(editMode)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Image Gallery</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search images..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground">No images found matching your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-background/80">
                    {image.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{image.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{image.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <span>{image.uploadedBy}</span>
                  <span className="mx-1">•</span>
                  <span>{image.uploadedAt}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="default" size="sm" className="flex-1" onClick={() => openImageModal(image, false)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openImageModal(image, true)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Annotate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedImage && (
        <ImageAnnotationModal
          image={selectedImage}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isEditMode={isEditMode}
        />
      )}
    </div>
  )
}

