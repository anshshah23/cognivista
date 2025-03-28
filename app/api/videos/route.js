import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Video from "@/models/videoModel"
import { NextResponse } from "next/server"

// Connect to the database
connect()

// Get all videos (with optional filtering)
export async function GET(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const url = new URL(request.url)
    const searchQuery = url.searchParams.get("search") || ""

    // Build query - show user's private videos and all public videos
    const query = {
      $or: [{ user: user._id }, { isPublic: true }],
    }

    // Add search if provided
    if (searchQuery) {
      query.$and = [
        {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
          ],
        },
      ]
    }

    const videos = await Video.find(query).populate("user", "username").sort({ createdAt: -1 })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("Videos Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Create a new video
export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()
    const { title, description, filePath, sourceUrl, thumbnail, duration, isPublic } = reqBody

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!filePath && !sourceUrl) {
      return NextResponse.json({ error: "Either file path or source URL is required" }, { status: 400 })
    }

    const newVideo = new Video({
      user: user._id,
      title,
      description,
      filePath,
      sourceUrl,
      thumbnail,
      duration,
      isPublic: isPublic !== undefined ? isPublic : true,
    })

    await newVideo.save()

    return NextResponse.json({
      message: "Video created successfully",
      video: newVideo,
    })
  } catch (error) {
    console.error("Video Creation Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

