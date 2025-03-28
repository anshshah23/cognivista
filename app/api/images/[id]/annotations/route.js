import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Image from "@/models/imageModel"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to the database
connect()

// Add an annotation to an image
export async function POST(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const imageId = params.id
    const reqBody = await request.json()
    const { x, y, text, color } = reqBody

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 })
    }

    if (x === undefined || y === undefined || !text) {
      return NextResponse.json({ error: "Coordinates and text are required for annotations" }, { status: 400 })
    }

    const image = await Image.findById(imageId)

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Add the annotation
    const newAnnotation = {
      x,
      y,
      text,
      color: color || "#ff0000",
      createdBy: user._id,
    }

    image.annotations.push(newAnnotation)
    await image.save()

    return NextResponse.json({
      message: "Annotation added successfully",
      annotation: image.annotations[image.annotations.length - 1],
    })
  } catch (error) {
    console.error("Annotation Creation Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Update annotations (replace all)
export async function PUT(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const imageId = params.id
    const reqBody = await request.json()
    const { annotations } = reqBody

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 })
    }

    if (!Array.isArray(annotations)) {
      return NextResponse.json({ error: "Annotations must be an array" }, { status: 400 })
    }

    const image = await Image.findById(imageId)

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Check if user owns this image
    if (image.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update annotations for this image" },
        { status: 403 },
      )
    }

    // Replace annotations
    image.annotations = annotations.map((annotation) => ({
      ...annotation,
      createdBy: user._id,
    }))

    await image.save()

    return NextResponse.json({
      message: "Annotations updated successfully",
      annotations: image.annotations,
    })
  } catch (error) {
    console.error("Annotations Update Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

