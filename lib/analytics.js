"use client"

// Analytics tracking utility
class AnalyticsTracker {
  constructor() {
    this.currentSession = null
    this.actions = 0
  }

  // Start tracking a session for a specific service
  startSession(service) {
    // End any existing session first
    this.endSession()

    this.currentSession = {
      service,
      startTime: new Date(),
      actions: 0,
    }

    // Store in localStorage to persist across page refreshes
    localStorage.setItem("currentAnalyticsSession", JSON.stringify(this.currentSession))

    return this.currentSession
  }

  // End the current tracking session and send data to the server
  async endSession() {
    // Check if there's an active session
    const storedSession = localStorage.getItem("currentAnalyticsSession")
    if (storedSession) {
      this.currentSession = JSON.parse(storedSession)
    }

    if (!this.currentSession) return null

    const endTime = new Date()
    const duration = Math.round((endTime - new Date(this.currentSession.startTime)) / 1000) // in seconds

    // Only record if duration is meaningful (more than 5 seconds)
    if (duration > 5) {
      try {
        const response = await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service: this.currentSession.service,
            startTime: this.currentSession.startTime,
            endTime: endTime.toISOString(),
            duration,
            actions: this.actions + this.currentSession.actions,
          }),
        })

        if (!response.ok) {
          console.error("Failed to record analytics")
        }
      } catch (error) {
        console.error("Analytics recording error:", error)
      }
    }

    // Clear the current session
    localStorage.removeItem("currentAnalyticsSession")
    const completedSession = this.currentSession
    this.currentSession = null
    this.actions = 0

    return {
      ...completedSession,
      endTime,
      duration,
    }
  }

  // Record an action for the current service
  recordAction() {
    if (this.currentSession) {
      this.actions++

      // Update stored session
      const storedSession = localStorage.getItem("currentAnalyticsSession")
      if (storedSession) {
        const session = JSON.parse(storedSession)
        session.actions++
        localStorage.setItem("currentAnalyticsSession", JSON.stringify(session))
      }
    }
  }

  // Resume a session if one exists in localStorage (e.g., after page refresh)
  resumeSession() {
    const storedSession = localStorage.getItem("currentAnalyticsSession")
    if (storedSession) {
      this.currentSession = JSON.parse(storedSession)
      return this.currentSession
    }
    return null
  }
}

// Create a singleton instance
const analyticsTracker = new AnalyticsTracker()

// Add window event listeners for page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    analyticsTracker.endSession()
  })

  // Resume session on page load
  window.addEventListener("load", () => {
    analyticsTracker.resumeSession()
  })
}

export default analyticsTracker