import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Collaboration from "@/models/collaborationModel"
import { NextResponse } from "next/server"

console.log("✅ Join route loaded successfully")
connect()

// POST - Join a collaboration session with sessionId
export async function POST(request, { params }) {
  
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = params

    const session = await Collaboration.findOne({ sessionId })
      .populate("owner", "username email")
      .populate("participants", "username email")

    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found. Please check the session ID." 
      }, { status: 404 })
    }

    // Check if user is already the owner
    if (session.owner._id.toString() === user._id.toString()) {
      return NextResponse.json({ 
        success: true,
        message: "You are already the owner of this session",
        session,
        role: "owner"
      })
    }

    // Check if user is already a participant
    const isParticipant = session.participants.some(p => p._id.toString() === user._id.toString())
    
    if (isParticipant) {
      return NextResponse.json({ 
        success: true,
        message: "You are already a participant in this session",
        session,
        role: "participant"
      })
    }

    // Add user as participant
    session.participants.push(user._id)
    session.lastActivity = new Date()
    await session.save()
    await session.populate("participants", "username email")

    // Add a system message about the new participant
    session.messages.push({
      user: user._id,
      text: `${user.username} joined the collaboration`,
    })
    await session.save()

    return NextResponse.json({ 
      success: true,
      message: "Successfully joined the collaboration session",
      session,
      role: "participant"
    }, { status: 201 })
  } catch (error) {
    console.error("Join Session Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}

// DELETE - Leave a collaboration session (participants only)
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

    // Check if user is the owner
    if (session.owner.toString() === user._id.toString()) {
      return NextResponse.json({ 
        success: false,
        error: "Session owner cannot leave. Delete the session instead." 
      }, { status: 400 })
    }

    // Check if user is a participant
    const participantIndex = session.participants.findIndex(p => p.toString() === user._id.toString())
    
    if (participantIndex === -1) {
      return NextResponse.json({ 
        success: false,
        error: "You are not a participant in this session" 
      }, { status: 400 })
    }

    // Remove participant
    session.participants.splice(participantIndex, 1)
    session.lastActivity = new Date()
    
    // Add a system message about leaving
    session.messages.push({
      user: user._id,
      text: `${user.username} left the collaboration`,
    })
    
    await session.save()

    return NextResponse.json({ 
      success: true,
      message: "Successfully left the collaboration session" 
    })
  } catch (error) {
    console.error("Leave Session Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}

// GET - Get list of participants
export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = await params

    const session = await Collaboration.findOne({ sessionId })
      .select("owner participants")
      .populate("owner", "username email")
      .populate("participants", "username email")

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
      owner: session.owner,
      participants: session.participants,
      totalParticipants: session.participants.length + 1 // +1 for owner
    })
  } catch (error) {
    console.error("Get Participants Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}
