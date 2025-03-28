import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import User from "@/models/userModel"

export async function authenticateUser(request) {
  try {
    const token = request.cookies.get("token")?.value || ""

    if (!token) {
      return { error: "Unauthorized - No token provided", status: 401 }
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decodedToken.id).select("-password")

    if (!user) {
      return { error: "Unauthorized - User not found", status: 401 }
    }

    return { user }
  } catch (error) {
    return { error: "Unauthorized - Invalid token", status: 401 }
  }
}

export function authMiddleware(handler) {
  return async (request) => {
    const auth = await authenticateUser(request)

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Add user to request for the handler to use
    request.user = auth.user

    return handler(request)
  }
}

