import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Analytics from "@/models/analyticsModel"
import { NextResponse } from "next/server"

// Connect to the database
connect()

// Get summary analytics data for the user
export async function GET(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const url = new URL(request.url)
    const period = url.searchParams.get("period") || "week" // week, month, year, all

    // Calculate date range based on period
    const endDate = new Date()
    let startDate = new Date()

    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "month":
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case "all":
        startDate = new Date(0) // Beginning of time
        break
      default:
        startDate.setDate(startDate.getDate() - 7) // Default to week
    }

    // Get analytics data within date range
    const analytics = await Analytics.find({
      user: user._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 })

    // Calculate summary statistics
    const summary = {
      totalDuration: 0,
      serviceBreakdown: {},
      dailyUsage: {},
      mostUsedService: "",
      averageDailyUsage: 0,
      totalSessions: 0,
    }

    // Initialize service breakdown
    const services = ["whiteboard", "video", "image-learning", "quizzes", "collaboration"]
    services.forEach((service) => {
      summary.serviceBreakdown[service] = 0
    })

    analytics.forEach((record) => {
      // Add to total duration
      summary.totalDuration += record.totalDuration

      // Add to service breakdown
      summary.serviceBreakdown[record.service] += record.totalDuration

      // Add to daily usage
      const dateStr = record.date.toISOString().split("T")[0]
      if (!summary.dailyUsage[dateStr]) {
        summary.dailyUsage[dateStr] = 0
      }
      summary.dailyUsage[dateStr] += record.totalDuration

      // Count sessions
      summary.totalSessions += record.sessions.length
    })

    // Find most used service
    let maxDuration = 0
    for (const [service, duration] of Object.entries(summary.serviceBreakdown)) {
      if (duration > maxDuration) {
        maxDuration = duration
        summary.mostUsedService = service
      }
    }

    // Calculate average daily usage
    const days = Object.keys(summary.dailyUsage).length || 1
    summary.averageDailyUsage = summary.totalDuration / days

    // Format durations as hours
    summary.totalDurationHours = (summary.totalDuration / 3600).toFixed(1)
    summary.averageDailyUsageHours = (summary.averageDailyUsage / 3600).toFixed(1)

    for (const service in summary.serviceBreakdown) {
      summary.serviceBreakdown[service] = {
        seconds: summary.serviceBreakdown[service],
        hours: (summary.serviceBreakdown[service] / 3600).toFixed(1),
      }
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Analytics Summary Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

