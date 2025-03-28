import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Collaboration from "@/models/collaborationModel"
import { NextResponse } from "next/server"

// Connect to the database
connect()

// Get all collaboration sessions for the user
export async function GET(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user

    // Find sessions where user is owner or participant
    const sessions = await Collaboration.find({
      $or: [{ owner: user._id }, { participants: user._id }],
    })
      .populate("owner", "username")
      .populate("participants", "username")
      .sort({ lastActivity: -1 })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Collaboration Sessions Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Create a new collaboration session
export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()
    const { title, content } = reqBody

    // Generate a unique session ID
    const sessionId = `session-${Math.random().toString(36).substring(2, 9)}`

    const newSession = new Collaboration({
      sessionId,
      title: title || "Untitled Document",
      content: content || "",
      owner: user._id,
      participants: [],
    })

    await newSession.save()

    return NextResponse.json({
      message: "Collaboration session created successfully",
      session: {
        ...newSession.toObject(),
        owner: { _id: user._id, username: user.username },
      },
    })
  } catch (error) {
    console.error("Collaboration Creation Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

