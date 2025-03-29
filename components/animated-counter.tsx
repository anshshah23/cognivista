"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function AnimatedCounter({ value, duration = 2000, suffix = "", prefix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const countRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (inView) {
      const step = Math.ceil(value / (duration / 16))

      if (timerRef.current) clearInterval(timerRef.current)

      timerRef.current = setInterval(() => {
        countRef.current += step

        if (countRef.current >= value) {
          countRef.current = value
          if (timerRef.current) clearInterval(timerRef.current)
        }

        setCount(countRef.current)
      }, 16)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [inView, value, duration])

  return (
    <span ref={ref} className="font-bold text-4xl md:text-5xl">
      {prefix}
      {inView ? count.toLocaleString() : 0}
      {suffix}
    </span>
  )
}

