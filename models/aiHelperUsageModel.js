import mongoose from "mongoose"

const aiHelperUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collaborations",
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    dailyLimit: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
)

// Compound index to ensure one document per user per session per day
aiHelperUsageSchema.index({ user: 1, session: 1, date: 1 }, { unique: true })

const AIHelperUsage = mongoose.models.ai_helper_usage || mongoose.model("ai_helper_usage", aiHelperUsageSchema)

export default AIHelperUsage
