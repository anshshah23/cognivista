import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Video from "@/models/videoModel"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to the database
connect()

// Get a specific video
export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const videoId = params.id

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 })
    }

    const video = await Video.findById(videoId).populate("user", "username")

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user has access to this video
    if (!video.isPublic && video.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "You don't have permission to view this video" }, { status: 403 })
    }

    // Increment view count if not the owner
    if (video.user.toString() !== user._id.toString()) {
      video.views += 1
      await video.save()
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error("Video Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Update a video
export async function PUT(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const videoId = params.id
    const reqBody = await request.json()

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 })
    }

    const video = await Video.findById(videoId)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user owns this video
    if (video.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "You don't have permission to update this video" }, { status: 403 })
    }

    // Update fields
    const { title, description, filePath, sourceUrl, thumbnail, isPublic } = reqBody

    if (title !== undefined) video.title = title
    if (description !== undefined) video.description = description
    if (filePath !== undefined) video.filePath = filePath
    if (sourceUrl !== undefined) video.sourceUrl = sourceUrl
    if (thumbnail !== undefined) video.thumbnail = thumbnail
    if (isPublic !== undefined) video.isPublic = isPublic

    await video.save()

    return NextResponse.json({
      message: "Video updated successfully",
      video,
    })
  } catch (error) {
    console.error("Video Update Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Delete a video
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const videoId = params.id

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 })
    }

    const video = await Video.findById(videoId)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user owns this video
    if (video.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: "You don't have permission to delete this video" }, { status: 403 })
    }

    await Video.findByIdAndDelete(videoId)

    return NextResponse.json({
      message: "Video deleted successfully",
    })
  } catch (error) {
    console.error("Video Delete Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

