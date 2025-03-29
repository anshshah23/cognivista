"use client"
import { motion } from "framer-motion"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden hero-pattern">
      <div className="absolute inset-0"></div>

      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-light/20 blur-[120px] dark:bg-purple-light/10"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-teal-light/20 blur-[100px] dark:bg-teal-light/10"
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-pink-light/20 blur-[80px] dark:bg-pink-light/10"
        animate={{
          x: [0, 70, -30, 0],
          y: [0, -30, 70, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Additional lighter gradient blobs */}
      <motion.div
        className="absolute top-1/3 left-1/5 w-[300px] h-[300px] rounded-full bg-yellow-600/30 blur-[60px] dark:bg-yellow-600/20"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/5 left-1/3 w-[350px] h-[350px] rounded-full bg-blue-600/30 blur-[70px] dark:bg-blue-600/20"
        animate={{
          x: [0, -40, 40, 0],
          y: [0, 40, -40, 0],
        }}
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/6 right-1/6 w-[250px] h-[250px] rounded-full bg-green-600/30 blur-[50px] dark:bg-green-600/20"
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{
          duration: 16,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Additional animated gradient layers */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 opacity-20 blur-2xl"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-blue-600 via-green-600 to-purple-600 opacity-20 blur-2xl"
        animate={{
          backgroundPosition: ["50% 0%", "50% 100%", "50% 0%"],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Gradient lines */}
      <div className="absolute inset-0 overflow-hidden opacity-70">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/6000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" opacity="0.1" />
        </svg>
      </div>
    </div>
  )
}
