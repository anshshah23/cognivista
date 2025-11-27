import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Quiz from "@/models/quizModel"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to the database
connect()

// Get a specific quiz
export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: quizId } = await params

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }

    const quiz = await Quiz.findById(quizId).populate("user", "username")

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Check if user has access to this quiz
    if (!quiz.isPublic && quiz.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "You don't have permission to view this quiz" }, { status: 403 })
    }

    // If user is not the owner, hide correct answers but keep structure
    if (quiz.user.toString() !== user._id.toString()) {
      const quizWithoutAnswers = quiz.toObject()
      quizWithoutAnswers.questions = quiz.questions.map((q) => {
        const questionObj = q.toObject()
        return {
          ...questionObj,
          _id: q._id,
          correctAnswers: [], // Hide correct answers from non-owners
        }
      })
      return NextResponse.json({ quiz: quizWithoutAnswers })
    }

    return NextResponse.json({ quiz })
  } catch (error) {
    console.error("Quiz Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Update a quiz
export async function PUT(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: quizId } = await params
    const reqBody = await request.json()

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }

    const quiz = await Quiz.findById(quizId)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Check if user owns this quiz
    if (quiz.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "You don't have permission to update this quiz" }, { status: 403 })
    }

    // Update fields
    const { title, description, subject, timeLimit, isPublic, questions } = reqBody

    if (title !== undefined) quiz.title = title
    if (description !== undefined) quiz.description = description
    if (subject !== undefined) quiz.subject = subject
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit
    if (isPublic !== undefined) quiz.isPublic = isPublic

    if (questions !== undefined) {
      // Validate questions
      if (!Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: "At least one question is required" }, { status: 400 })
      }

      // Validate each question
      for (const question of questions) {
        if (!question.text || !question.type) {
          return NextResponse.json({ error: "Each question must have text and type" }, { status: 400 })
        }

        if (!Array.isArray(question.options) || question.options.length < 2) {
          return NextResponse.json({ error: "Each question must have at least two options" }, { status: 400 })
        }

        if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
          return NextResponse.json({ error: "Each question must have at least one correct answer" }, { status: 400 })
        }
      }

      quiz.questions = questions
    }

    await quiz.save()

    return NextResponse.json({
      message: "Quiz updated successfully",
      quiz,
    })
  } catch (error) {
    console.error("Quiz Update Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Delete a quiz
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: quizId } = await params

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }

    const quiz = await Quiz.findById(quizId)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Check if user owns this quiz
    if (quiz.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: "You don't have permission to delete this quiz" }, { status: 403 })
    }

    await Quiz.findByIdAndDelete(quizId)

    return NextResponse.json({
      message: "Quiz deleted successfully",
    })
  } catch (error) {
    console.error("Quiz Delete Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

