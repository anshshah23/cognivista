import mongoose from "mongoose"

const videoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    description: {
      type: String,
      default: "",
    },
    filePath: {
      type: String,
    },
    sourceUrl: {
      type: String,
    },
    thumbnail: {
      type: String,
      default: "/placeholder.svg",
    },
    duration: {
      type: String,
      default: "0:00",
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Ensure either filePath or sourceUrl is provided
videoSchema.pre("save", function (next) {
  if (!this.filePath && !this.sourceUrl) {
    return next(new Error("Either file path or source URL must be provided"))
  }
  next()
})

const Video = mongoose.models.videos || mongoose.model("videos", videoSchema)

export default Video

