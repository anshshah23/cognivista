import { NextResponse } from "next/server"
import { authenticateUser } from "@/middleware/authMiddleware"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import fs from "fs/promises"

// Handle file uploads
export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const originalName = file.name
    const extension = path.extname(originalName)
    const filename = `${uuidv4()}${extension}`

    // Determine file type and directory
    const fileType = formData.get("type") || "image"
    let uploadDir

    switch (fileType) {
      case "image":
        uploadDir = path.join(process.cwd(), "public/uploads/images")
        break
      case "video":
        uploadDir = path.join(process.cwd(), "public/uploads/videos")
        break
      case "document":
        uploadDir = path.join(process.cwd(), "public/uploads/documents")
        break
      default:
        uploadDir = path.join(process.cwd(), "public/uploads/other")
    }

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true })

    // Write file to disk
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicPath = `/uploads/${fileType}s/${filename}`

    return NextResponse.json({
      success: true,
      filePath: publicPath,
      filename,
      originalName,
    })
  } catch (error) {
    console.error("Upload Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

