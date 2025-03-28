import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Image from "@/models/imageModel"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to the database
connect()

// Delete a specific annotation
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: imageId, annotationId } = params

    if (!mongoose.Types.ObjectId.isValid(imageId) || !mongoose.Types.ObjectId.isValid(annotationId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const image = await Image.findById(imageId)

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Find the annotation
    const annotation = image.annotations.id(annotationId)

    if (!annotation) {
      return NextResponse.json({ error: "Annotation not found" }, { status: 404 })
    }

    // Check if user created this annotation or owns the image
    if (
      annotation.createdBy.toString() !== user._id.toString() &&
      image.user.toString() !== user._id.toString() &&
      !user.isAdmin
    ) {
      return NextResponse.json({ error: "You don't have permission to delete this annotation" }, { status: 403 })
    }

    // Remove the annotation
    annotation.remove()
    await image.save()

    return NextResponse.json({
      message: "Annotation deleted successfully",
    })
  } catch (error) {
    console.error("Annotation Delete Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

