import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import User from "@/models/userModel"
import bcryptjs from "bcryptjs"
import { NextResponse } from "next/server"

// Connect to the database
connect()

export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()
    const { currentPassword, newPassword } = reqBody

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    // Get user with password
    const userWithPassword = await User.findById(user._id)

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(currentPassword, userWithPassword.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(newPassword, salt)

    // Update password
    userWithPassword.password = hashedPassword
    await userWithPassword.save()

    return NextResponse.json({
      message: "Password changed successfully",
      success: true,
    })
  } catch (error) {
    console.error("Change Password Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

