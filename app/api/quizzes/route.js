import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Quiz from "@/models/quizModel"
import { NextResponse } from "next/server"

// Connect to the database
connect()

// Get all quizzes (with optional filtering)
export async function GET(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const url = new URL(request.url)
    const searchQuery = url.searchParams.get("search") || ""
    const subject = url.searchParams.get("subject") || ""

    // Build query - show user's private quizzes and all public quizzes
    const query = {
      $or: [{ user: user._id }, { isPublic: true }],
    }

    // Add subject filter if provided
    if (subject) {
      query.subject = subject
    }

    // Add search if provided
    if (searchQuery) {
      query.$and = [
        {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
            { subject: { $regex: searchQuery, $options: "i" } },
          ],
        },
      ]
    }

    const quizzes = await Quiz.find(query)
      .populate("user", "username")
      .select("-questions.correctAnswers") // Don't send correct answers to client
      .sort({ createdAt: -1 })

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error("Quizzes Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

// Create a new quiz
export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()
    const { title, description, subject, timeLimit, isPublic, questions } = reqBody

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

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

    const newQuiz = new Quiz({
      user: user._id,
      title,
      description,
      subject,
      timeLimit: timeLimit || 0,
      isPublic: isPublic !== undefined ? isPublic : true,
      questions,
    })

    await newQuiz.save()

    return NextResponse.json({
      message: "Quiz created successfully",
      quiz: newQuiz,
    })
  } catch (error) {
    console.error("Quiz Creation Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

