import { type NextRequest, NextResponse } from "next/server"

// This would be replaced with a real database in a production app
const whiteboards: { id: string; data: string }[] = []

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()

    if (!data) {
      return NextResponse.json({ error: "Missing whiteboard data" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    whiteboards.push({ id, data })

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    console.error("Error saving whiteboard:", error)
    return NextResponse.json({ error: "Failed to save whiteboard" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (id) {
      const whiteboard = whiteboards.find((wb) => wb.id === id)

      if (!whiteboard) {
        return NextResponse.json({ error: "Whiteboard not found" }, { status: 404 })
      }

      return NextResponse.json(whiteboard)
    }

    // Return all whiteboards (just IDs, not data)
    const whiteboardsList = whiteboards.map(({ id }) => ({ id }))
    return NextResponse.json(whiteboardsList)
  } catch (error) {
    console.error("Error retrieving whiteboard:", error)
    return NextResponse.json({ error: "Failed to retrieve whiteboard" }, { status: 500 })
  }
}

