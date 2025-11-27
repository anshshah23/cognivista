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
    const { id: quizId } = await params
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

    console.log(`Grading quiz: ${quiz.title} for user: ${user.email}`)

    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId)

      if (!question) {
        console.log(`Question not found: ${answer.questionId}`)
        continue // Skip if question not found
      }

      // Create a map of option _id to option index (opt1, opt2, etc.)
      const optionIdMap = {}
      question.options.forEach((option, index) => {
        optionIdMap[String(option._id)] = `opt${index + 1}`
      })

      // Convert correctAnswers to the same format (they're already opt1, opt2, etc.)
      const correctAnswersStr = question.correctAnswers.map(a => String(a))
      
      // Convert selected option ObjectIds to opt1, opt2, etc. format
      const selectedOptionsAsOptIds = answer.selectedOptions
        .map(optionId => optionIdMap[String(optionId)])
        .filter(Boolean) // Remove any undefined values

      console.log(`Question: ${question.text}`)
      console.log(`Correct answers: ${correctAnswersStr.join(', ')}`)
      console.log(`Selected answers (ObjectIds): ${answer.selectedOptions.join(', ')}`)
      console.log(`Selected answers (mapped): ${selectedOptionsAsOptIds.join(', ')}`)

      // Check if answer is correct (must match all correct answers)
      const isCorrect =
        selectedOptionsAsOptIds.length === correctAnswersStr.length &&
        selectedOptionsAsOptIds.every((opt) => correctAnswersStr.includes(opt)) &&
        correctAnswersStr.every((opt) => selectedOptionsAsOptIds.includes(opt))

      console.log(`Is correct: ${isCorrect}`)

      if (isCorrect) {
        score++
      }

      // Convert correct answer opt1, opt2 format back to ObjectIds for frontend display
      const correctAnswerObjectIds = correctAnswersStr
        .map(optId => {
          const index = parseInt(optId.replace('opt', '')) - 1
          return question.options[index] ? String(question.options[index]._id) : null
        })
        .filter(Boolean)

      gradedAnswers.push({
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions.map(o => String(o)), // Store as strings for consistency
        correctAnswers: correctAnswerObjectIds, // Return ObjectIds for frontend to match against option._id
        isCorrect,
      })
    }

    console.log(`Final score: ${score}/${quiz.questions.length} (${Math.round((score / quiz.questions.length) * 100)}%)`)

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

