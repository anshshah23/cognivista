import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Image from "@/models/imageModel"
import { NextResponse } from "next/server"

// Connect to the database
connect()

// Get all images (with optional filtering)
export async function GET(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const url = new URL(request.url)
    const searchQuery = url.searchParams.get("search") || ""
    const category = url.searchParams.get("category") || ""

    // Build query - show user's private images and all public images
    const query = {
      $or: [{ user: user._id }, { isPublic: true }],
    }

    // Add category filter if provided
    if (category) {
      query.category = category
    }

    // Add search if provided
    if (searchQuery) {
      query.$and = [
        {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } },
          ],
        },
      ]
    }

    const images = await Image.find(query).populate("user", "username").sort({ createdAt: -1 })

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Images Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Create a new image
export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()
    const { title, description, category, filePath, isPublic } = reqBody

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!filePath) {
      return NextResponse.json({ error: "Image file path is required" }, { status: 400 })
    }

    const newImage = new Image({
      user: user._id,
      title,
      description,
      category,
      filePath,
      isPublic: isPublic !== undefined ? isPublic : true,
    })

    await newImage.save()

    return NextResponse.json({
      message: "Image created successfully",
      image: newImage,
    })
  } catch (error) {
    console.error("Image Creation Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

