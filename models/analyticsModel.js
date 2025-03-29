import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
})

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    service: {
      type: String,
      enum: ["whiteboard", "video", "image-learning", "quizzes", "collaboration"],
      required: true,
    },
    sessions: [sessionSchema],
    totalDuration: {
      type: Number, // in seconds
      default: 0,
    },
    actions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Create a compound index on user and date for faster queries
analyticsSchema.index({ user: 1, date: 1 })

const Analytics = mongoose.models.analytics || mongoose.model("analytics", analyticsSchema)

export default Analytics

