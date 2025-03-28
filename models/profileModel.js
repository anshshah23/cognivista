import mongoose from "mongoose"

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "/placeholder.svg",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    notifications: {
      email: {
        newMessages: { type: Boolean, default: true },
        newComments: { type: Boolean, default: false },
        reminders: { type: Boolean, default: true },
        updates: { type: Boolean, default: true },
      },
      push: {
        newMessages: { type: Boolean, default: true },
        newComments: { type: Boolean, default: true },
        reminders: { type: Boolean, default: false },
        updates: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true },
)

const Profile = mongoose.models.profiles || mongoose.model("profiles", profileSchema)

export default Profile

