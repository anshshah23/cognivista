import VideoGallery from "@/components/video/video-gallery"
import VideoUploadForm from "@/components/video/video-upload-form"
import { Separator } from "@/components/ui/separator"

export default function VideoPage() {
  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Learning</h1>
          <p className="text-muted-foreground">Upload, watch, and learn from educational videos.</p>
        </div>
        <Separator />

        <VideoUploadForm />
        <Separator />
        <VideoGallery />
      </div>
    </div>
  )
}

