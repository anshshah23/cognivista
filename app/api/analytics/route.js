import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Analytics from "@/models/analyticsModel"
import { NextResponse } from "next/server"

// Connect to the database
connect()

// Get analytics data for the user
export async function GET(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const service = url.searchParams.get("service")

    const query = { user: user._id }

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Add service filter if provided
    if (service) {
      query.service = service
    }

    const analytics = await Analytics.find(query).sort({ date: -1 })

    // Calculate summary statistics
    const summary = {
      totalDuration: 0,
      serviceBreakdown: {},
      dailyUsage: {},
    }

    analytics.forEach((record) => {
      // Add to total duration
      summary.totalDuration += record.totalDuration

      // Add to service breakdown
      if (!summary.serviceBreakdown[record.service]) {
        summary.serviceBreakdown[record.service] = 0
      }
      summary.serviceBreakdown[record.service] += record.totalDuration

      // Add to daily usage
      const dateStr = record.date.toISOString().split("T")[0]
      if (!summary.dailyUsage[dateStr]) {
        summary.dailyUsage[dateStr] = 0
      }
      summary.dailyUsage[dateStr] += record.totalDuration
    })

    return NextResponse.json({ analytics, summary })
  } catch (error) {
    console.error("Analytics Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Record a new analytics session
export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()
    const { service, startTime, endTime, duration, actions } = reqBody

    if (!service) {
      return NextResponse.json({ error: "Service is required" }, { status: 400 })
    }

    // Get today's date (without time)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find or create analytics record for today and the specified service
    let analyticsRecord = await Analytics.findOne({
      user: user._id,
      date: today,
      service,
    })

    if (!analyticsRecord) {
      analyticsRecord = new Analytics({
        user: user._id,
        date: today,
        service,
        sessions: [],
        totalDuration: 0,
        actions: 0,
      })
    }

    // Add new session if provided
    if (startTime) {
      const newSession = {
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration: duration || 0,
      }

      analyticsRecord.sessions.push(newSession)
      analyticsRecord.totalDuration += newSession.duration
    }

    // Update actions count if provided
    if (actions) {
      analyticsRecord.actions += actions
    }

    await analyticsRecord.save()

    return NextResponse.json({
      message: "Analytics recorded successfully",
      analytics: analyticsRecord,
    })
  } catch (error) {
    console.error("Analytics Recording Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

