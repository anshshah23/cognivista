import mongoose from "mongoose"

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
})

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "multiple-select"],
    required: true,
  },
  options: [optionSchema],
  correctAnswers: [
    {
      type: String,
      required: true,
    },
  ],
})

const quizSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    timeLimit: {
      type: Number,
      default: 0, // 0 means no time limit
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    questions: [questionSchema],
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

const Quiz = mongoose.models.quizzes || mongoose.model("quizzes", quizSchema)

export default Quiz

