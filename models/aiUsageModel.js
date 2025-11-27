import mongoose from "mongoose"

const aiUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    requests: [
      {
        timestamp: Date,
        sessionId: String,
        prompt: String,
        response: String,
      },
    ],
  },
  { timestamps: true }
)

// Compound index to ensure one document per user per day
aiUsageSchema.index({ user: 1, date: 1 }, { unique: true })

const AIUsage = mongoose.models.aiusages || mongoose.model("aiusages", aiUsageSchema)

export default AIUsage
