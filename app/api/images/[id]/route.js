import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Image from "@/models/imageModel"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to the database
connect()

// Get a specific image
export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const imageId = params.id

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 })
    }

    const image = await Image.findById(imageId)
      .populate("user", "username")
      .populate("annotations.createdBy", "username")

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Check if user has access to this image
    if (!image.isPublic && image.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "You don't have permission to view this image" }, { status: 403 })
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error("Image Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Update an image
export async function PUT(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const imageId = params.id
    const reqBody = await request.json()

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 })
    }

    const image = await Image.findById(imageId)

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Check if user owns this image
    if (image.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "You don't have permission to update this image" }, { status: 403 })
    }

    // Update fields
    const { title, description, category, filePath, isPublic } = reqBody

    if (title !== undefined) image.title = title
    if (description !== undefined) image.description = description
    if (category !== undefined) image.category = category
    if (filePath !== undefined) image.filePath = filePath
    if (isPublic !== undefined) image.isPublic = isPublic

    await image.save()

    return NextResponse.json({
      message: "Image updated successfully",
      image,
    })
  } catch (error) {
    console.error("Image Update Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Delete an image
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const imageId = params.id

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 })
    }

    const image = await Image.findById(imageId)

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Check if user owns this image
    if (image.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: "You don't have permission to delete this image" }, { status: 403 })
    }

    await Image.findByIdAndDelete(imageId)

    return NextResponse.json({
      message: "Image deleted successfully",
    })
  } catch (error) {
    console.error("Image Delete Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

