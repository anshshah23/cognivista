import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Whiteboard from "@/models/whiteboardModel"
import { NextResponse } from "next/server"

// Connect to the database
connect()

// Get all whiteboards for the user
export async function GET(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const url = new URL(request.url)
    const isPublic = url.searchParams.get("public") === "true"

    let query = {}

    if (isPublic) {
      // Get public whiteboards
      query = { isPublic: true }
    } else {
      // Get user's whiteboards and whiteboards where user is a collaborator
      query = {
        $or: [{ user: user._id }, { collaborators: user._id }],
      }
    }

    const whiteboards = await Whiteboard.find(query)
      .select("-content") // Don't send the full content in the list
      .populate("user", "username")
      .populate("collaborators", "username")
      .sort({ updatedAt: -1 })

    return NextResponse.json({ whiteboards })
  } catch (error) {
    console.error("Whiteboards Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Create a new whiteboard
export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()
    const { title, content, thumbnail, isPublic, collaborators, tags } = reqBody

    if (!content) {
      return NextResponse.json({ error: "Whiteboard content is required" }, { status: 400 })
    }

    const newWhiteboard = new Whiteboard({
      title: title || "Untitled Whiteboard",
      content,
      thumbnail,
      user: user._id,
      isPublic: isPublic || false,
      collaborators: collaborators || [],
      tags: tags || [],
    })

    await newWhiteboard.save()

    return NextResponse.json({
      message: "Whiteboard created successfully",
      whiteboard: newWhiteboard,
    })
  } catch (error) {
    console.error("Whiteboard Creation Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

