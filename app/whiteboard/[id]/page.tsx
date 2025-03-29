import { notFound } from "next/navigation"
import WhiteboardComponent from "@/components/whiteboard/whiteboard-component"

interface WhiteboardData {
    whiteboard: any // Replace `any` with the appropriate type if known
}

async function getWhiteboard(id: string): Promise<WhiteboardData | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/whiteboards/${id}`, {
            cache: "no-store",
        })

        if (!response.ok) {
            return null
        }

        return response.json()
    } catch (error) {
        console.error("Error fetching whiteboard:", error)
        return null
    }
}

export default async function WhiteboardPage({ params }: { params: { id: string } }) {
  console.log("Received params:", params); // Debugging

  if (!params || !params.id) {
    console.error("Whiteboard ID is missing from params.");
    notFound();
  }

  const { id } = params;
  const data = await getWhiteboard(id);

  if (!data || !data.whiteboard) {
    console.error("Whiteboard not found for ID:", id);
    notFound();
  }

  return (
    <div className="container py-6">
      <WhiteboardComponent id={id} initialData={data.whiteboard} />
    </div>
  );
}
