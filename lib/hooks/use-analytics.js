"use client"

import { useEffect } from "react"
import analyticsTracker from "@/lib/analytics"

export function useAnalytics(service) {
  useEffect(() => {
    // Start tracking session when component mounts
    analyticsTracker.startSession(service)

    // End tracking when component unmounts
    return () => {
      analyticsTracker.endSession()
    }
  }, [service])

  // Return a function to record actions
  const recordAction = () => {
    analyticsTracker.recordAction()
  }

  return { recordAction }
}

