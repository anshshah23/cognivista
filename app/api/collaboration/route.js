import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Collaboration from "@/models/collaborationModel"
import { NextResponse } from "next/server"
import DOMPurify from "isomorphic-dompurify"

// Connect to the database
connect()

// Input validation and sanitization
function validateAndSanitizeInput(title, content) {
  const errors = []
  
  // Validate title
  if (title && typeof title !== 'string') {
    errors.push('Title must be a string')
  }
  if (title && title.length > 200) {
    errors.push('Title cannot exceed 200 characters')
  }
  
  // Validate content
  if (content && typeof content !== 'string') {
    errors.push('Content must be a string')
  }
  if (content && content.length > 50000) {
    errors.push('Content cannot exceed 50,000 characters')
  }
  
  // Sanitize inputs to prevent XSS
  const sanitizedTitle = title ? DOMPurify.sanitize(title, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) : ""
  const sanitizedContent = content ? DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) : ""
  
  return {
    errors,
    sanitizedTitle,
    sanitizedContent
  }
}

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

    // Validate and sanitize input
    const validation = validateAndSanitizeInput(title, content)
    if (validation.errors.length > 0) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 })
    }

    // Generate a unique session ID
    const sessionId = `session-${Math.random().toString(36).substring(2, 9)}`

    const newSession = new Collaboration({
      sessionId,
      title: validation.sanitizedTitle || "Untitled Document",
      content: validation.sanitizedContent || "",
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

