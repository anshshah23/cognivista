import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Whiteboard from "@/models/whiteboardModel"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to the database
connect()

// Get a specific whiteboard
export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const whiteboardId = params.id

    if (!mongoose.Types.ObjectId.isValid(whiteboardId)) {
      return NextResponse.json({ error: "Invalid whiteboard ID" }, { status: 400 })
    }

    const whiteboard = await Whiteboard.findById(whiteboardId)
      .populate("user", "username")
      .populate("collaborators", "username")

    if (!whiteboard) {
      return NextResponse.json({ error: "Whiteboard not found" }, { status: 404 })
    }

    // Check if user has access to this whiteboard
    const isOwner = whiteboard.user._id.toString() === user._id.toString()
    const isCollaborator = whiteboard.collaborators.some((collab) => collab._id.toString() === user._id.toString())

    if (!isOwner && !isCollaborator && !whiteboard.isPublic) {
      return NextResponse.json({ error: "You don't have permission to view this whiteboard" }, { status: 403 })
    }

    return NextResponse.json({ whiteboard })
  } catch (error) {
    console.error("Whiteboard Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Update a whiteboard
export async function PUT(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const whiteboardId = params.id
    const reqBody = await request.json()
    const { title, content, thumbnail, isPublic, collaborators, tags } = reqBody

    if (!mongoose.Types.ObjectId.isValid(whiteboardId)) {
      return NextResponse.json({ error: "Invalid whiteboard ID" }, { status: 400 })
    }

    const whiteboard = await Whiteboard.findById(whiteboardId)

    if (!whiteboard) {
      return NextResponse.json({ error: "Whiteboard not found" }, { status: 404 })
    }

    // Check if user is the owner or a collaborator
    const isOwner = whiteboard.user.toString() === user._id.toString()
    const isCollaborator = whiteboard.collaborators.some((collab) => collab.toString() === user._id.toString())

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "You don't have permission to update this whiteboard" }, { status: 403 })
    }

    // Only owner can change these properties
    if (isOwner) {
      if (title !== undefined) whiteboard.title = title
      if (isPublic !== undefined) whiteboard.isPublic = isPublic
      if (collaborators !== undefined) whiteboard.collaborators = collaborators
      if (tags !== undefined) whiteboard.tags = tags
    }

    // Both owner and collaborators can update content
    if (content !== undefined) whiteboard.content = content
    if (thumbnail !== undefined) whiteboard.thumbnail = thumbnail

    whiteboard.lastModified = new Date()
    await whiteboard.save()

    return NextResponse.json({
      message: "Whiteboard updated successfully",
      whiteboard,
    })
  } catch (error) {
    console.error("Whiteboard Update Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Delete a whiteboard
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const whiteboardId = params.id

    if (!mongoose.Types.ObjectId.isValid(whiteboardId)) {
      return NextResponse.json({ error: "Invalid whiteboard ID" }, { status: 400 })
    }

    const whiteboard = await Whiteboard.findById(whiteboardId)

    if (!whiteboard) {
      return NextResponse.json({ error: "Whiteboard not found" }, { status: 404 })
    }

    // Only the owner can delete the whiteboard
    if (whiteboard.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: "You don't have permission to delete this whiteboard" }, { status: 403 })
    }

    await Whiteboard.findByIdAndDelete(whiteboardId)

    return NextResponse.json({
      message: "Whiteboard deleted successfully",
    })
  } catch (error) {
    console.error("Whiteboard Delete Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

