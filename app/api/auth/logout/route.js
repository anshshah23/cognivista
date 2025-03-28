import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
      success: true,
    })

    // Clear the token cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (err) {
    console.error("Logout Error:", err)
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 })
  }
}

