import { Separator } from "@/components/ui/separator"
import CollaborationEditor from "@/components/collaboration/collaboration-editor"

export default function CollaborationPage() {
  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collaboration</h1>
          <p className="text-muted-foreground">Work together with peers in real-time.</p>
        </div>
        <Separator />

        <CollaborationEditor />
      </div>
    </div>
  )
}

