import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Collaboration from "@/models/collaborationModel"
import { NextResponse } from "next/server"

console.log("✅ Collaboration sessions route loaded successfully")
connect()

// Simple input validation without DOMPurify for now
function validateInput(title, content) {
  const errors = []
  
  if (title && typeof title !== 'string') {
    errors.push('Title must be a string')
  }
  if (title && title.length > 200) {
    errors.push('Title cannot exceed 200 characters')
  }
  
  if (content && typeof content !== 'string') {
    errors.push('Content must be a string')
  }
  if (content && content.length > 100000) {
    errors.push('Content cannot exceed 100,000 characters')
  }
  
  return {
    errors,
    sanitizedTitle: title || "",
    sanitizedContent: content || ""
  }
}

// GET - List all collaboration sessions for the user
export async function GET(request) {
  console.log("GET /api/collaboration/sessions called")
  
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user

    const sessions = await Collaboration.find({
      $or: [{ owner: user._id }, { participants: user._id }],
    })
      .populate("owner", "username email")
      .populate("participants", "username email")
      .select("-messages") // Don't include messages in list view
      .sort({ lastActivity: -1 })
      .limit(50) // Limit to last 50 sessions

    return NextResponse.json({ 
      success: true,
      sessions,
      count: sessions.length
    })
  } catch (error) {
    console.error("Collaboration Sessions Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}

// POST - Create a new collaboration session
export async function POST(request) {
  console.log("POST /api/collaboration/sessions called")
  
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()
    const { title, content } = reqBody

    const validation = validateInput(title, content)
    if (validation.errors.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: validation.errors.join(', ') 
      }, { status: 400 })
    }

    // Generate unique session ID
    const sessionId = `collab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const newSession = new Collaboration({
      sessionId,
      title: validation.sanitizedTitle || "Untitled Document",
      content: validation.sanitizedContent || "",
      owner: user._id,
      participants: [],
      messages: [],
      isActive: true,
      lastActivity: new Date(),
    })

    await newSession.save()

    // Populate owner info before sending
    await newSession.populate("owner", "username email")

    return NextResponse.json({
      success: true,
      message: "Collaboration session created successfully",
      session: newSession,
    }, { status: 201 })
  } catch (error) {
    console.error("Session Creation Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}
