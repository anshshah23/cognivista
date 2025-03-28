import mongoose from "mongoose"

const annotationSchema = new mongoose.Schema(
  {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "#ff0000",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true },
)

const imageSchema = new mongoose.Schema(
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
    category: {
      type: String,
      default: "Uncategorized",
    },
    filePath: {
      type: String,
      required: [true, "Image file path is required"],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    annotations: [annotationSchema],
  },
  { timestamps: true },
)

const Image = mongoose.models.images || mongoose.model("images", imageSchema)

export default Image

