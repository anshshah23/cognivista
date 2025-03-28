import mongoose from "mongoose"

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  selectedOptions: [
    {
      type: String,
      required: true,
    },
  ],
  isCorrect: {
    type: Boolean,
    required: true,
  },
})

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "quizzes",
      required: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

const QuizAttempt = mongoose.models.quizAttempts || mongoose.model("quizAttempts", quizAttemptSchema)

export default QuizAttempt

