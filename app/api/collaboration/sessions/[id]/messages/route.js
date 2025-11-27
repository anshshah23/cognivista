import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Collaboration from "@/models/collaborationModel"
import { NextResponse } from "next/server"

console.log("✅ Messages route loaded successfully")
connect()

// GET - Get all messages for a session
export async function GET(request, { params }) {
  
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = await params

    const session = await Collaboration.findOne({ sessionId })
      .select("messages owner participants")
      .populate("messages.user", "username email")

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

    return NextResponse.json({ 
      success: true,
      messages: session.messages,
      count: session.messages.length
    })
  } catch (error) {
    console.error("Get Messages Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = await params
    const reqBody = await request.json()
    const { text } = reqBody

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ 
        success: false,
        error: "Message text is required" 
      }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ 
        success: false,
        error: "Message cannot exceed 5000 characters" 
      }, { status: 400 })
    }

    const sanitizedText = text.trim()

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

    // Add message to session
    const newMessage = {
      user: user._id,
      text: sanitizedText,
    }

    session.messages.push(newMessage)
    session.lastActivity = new Date()
    await session.save()

    // Get the last message with populated user info
    await session.populate("messages.user", "username email")
    const chatMessage = session.messages[session.messages.length - 1]

    return NextResponse.json({ 
      success: true,
      message: "Message sent successfully",
      chatMessage
    }, { status: 201 })
  } catch (error) {
    console.error("Send Message Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}
