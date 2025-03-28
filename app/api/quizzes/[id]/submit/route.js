import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Quiz from "@/models/quizModel"
import QuizAttempt from "@/models/quizAttemptModel"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to the database
connect()

// Submit a quiz attempt
export async function POST(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const quizId = params.id
    const reqBody = await request.json()
    const { answers, timeSpent } = reqBody

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 })
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: "Answers must be an array" }, { status: 400 })
    }

    const quiz = await Quiz.findById(quizId)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Check if user has access to this quiz
    if (!quiz.isPublic && quiz.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "You don't have permission to take this quiz" }, { status: 403 })
    }

    // Calculate score
    let score = 0
    const gradedAnswers = []

    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId)

      if (!question) {
        continue // Skip if question not found
      }

      // Check if answer is correct
      const isCorrect =
        answer.selectedOptions.length === question.correctAnswers.length &&
        answer.selectedOptions.every((opt) => question.correctAnswers.includes(opt))

      if (isCorrect) {
        score++
      }

      gradedAnswers.push({
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions,
        isCorrect,
      })
    }

    // Create quiz attempt record
    const quizAttempt = new QuizAttempt({
      user: user._id,
      quiz: quizId,
      answers: gradedAnswers,
      score,
      totalQuestions: quiz.questions.length,
      timeSpent: timeSpent || 0,
      completed: true,
    })

    await quizAttempt.save()

    // Increment quiz attempts counter
    quiz.attempts += 1
    await quiz.save()

    return NextResponse.json({
      message: "Quiz submitted successfully",
      result: {
        score,
        totalQuestions: quiz.questions.length,
        percentage: Math.round((score / quiz.questions.length) * 100),
        answers: gradedAnswers,
      },
    })
  } catch (error) {
    console.error("Quiz Submission Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

