import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Collaboration from "@/models/collaborationModel"
import { NextResponse } from "next/server"

console.log("✅ Session detail route loaded successfully")
connect()

// Simple input validation
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
    sanitizedTitle: title || undefined,
    sanitizedContent: content !== undefined ? content : undefined
  }
}

// GET - Get session details by sessionId
export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = await params

    const session = await Collaboration.findOne({ sessionId })
      .populate("owner", "username email")
      .populate("participants", "username email")
      .populate("messages.user", "username email")

    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found" 
      }, { status: 404 })
    }

    // Check if user has access to this session
    const hasAccess = session.owner._id.toString() === user._id.toString() || 
                     session.participants.some(p => p._id.toString() === user._id.toString())

    if (!hasAccess) {
      return NextResponse.json({ 
        success: false,
        error: "Access denied" 
      }, { status: 403 })
    }

    return NextResponse.json({ 
      success: true,
      session 
    })
  } catch (error) {
    console.error("Get Session Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}

// PUT - Update session content/title
export async function PUT(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = await params
    const reqBody = await request.json()
    const { title, content } = reqBody

    const session = await Collaboration.findOne({ sessionId })

    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found" 
      }, { status: 404 })
    }

    // Check if user has access to this session
    const hasAccess = session.owner.toString() === user._id.toString() || 
                     session.participants.some(p => p.toString() === user._id.toString())

    if (!hasAccess) {
      return NextResponse.json({ 
        success: false,
        error: "Access denied" 
      }, { status: 403 })
    }

    const validation = validateInput(title, content)
    if (validation.errors.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: validation.errors.join(', ') 
      }, { status: 400 })
    }

    // Update only provided fields
    if (validation.sanitizedTitle !== undefined) {
      session.title = validation.sanitizedTitle
    }
    if (validation.sanitizedContent !== undefined) {
      session.content = validation.sanitizedContent
    }
    session.lastActivity = new Date()

    await session.save()
    await session.populate("owner", "username email")
    await session.populate("participants", "username email")

    return NextResponse.json({ 
      success: true,
      message: "Session updated successfully",
      session 
    })
  } catch (error) {
    console.error("Update Session Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}

// DELETE - Delete a session (owner only)
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = await params

    const session = await Collaboration.findOne({ sessionId })

    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found" 
      }, { status: 404 })
    }

    // Only owner can delete
    if (session.owner.toString() !== user._id.toString()) {
      return NextResponse.json({ 
        success: false,
        error: "Only the session owner can delete it" 
      }, { status: 403 })
    }

    await Collaboration.deleteOne({ sessionId })

    return NextResponse.json({ 
      success: true,
      message: "Session deleted successfully" 
    })
  } catch (error) {
    console.error("Delete Session Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}
