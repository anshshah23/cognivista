import mongoose from "mongoose"

const whiteboardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      default: "Untitled Whiteboard",
    },
    content: {
      type: String, // JSON string of the canvas
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    tags: [String],
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const Whiteboard = mongoose.models.whiteboards || mongoose.model("whiteboards", whiteboardSchema)

export default Whiteboard

