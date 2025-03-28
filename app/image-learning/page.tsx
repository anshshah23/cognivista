import { Separator } from "@/components/ui/separator"
import ImageUploadForm from "@/components/image-learning/image-upload-form"
import ImageGallery from "@/components/image-learning/image-gallery"

export default function ImageLearningPage() {
  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Image-Based Learning</h1>
          <p className="text-muted-foreground">Upload, annotate, and learn from educational images.</p>
        </div>
        <Separator />

        <ImageUploadForm />
        <Separator />
        <ImageGallery />
      </div>
    </div>
  )
}

