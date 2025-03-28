import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import { NextResponse } from "next/server"

// Connect to the database
connect()

// Generate quiz questions using Gemini API
export async function POST(request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const reqBody = await request.json()
    const { prompt, numQuestions = 5, subject } = reqBody

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API is not configured" }, { status: 500 })
    }

    // Call Gemini API to generate questions
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`

    const promptText = `
      Generate ${numQuestions} quiz questions about ${prompt} for ${subject || "general knowledge"}.
      
      For each question, provide:
      1. The question text
      2. The question type (multiple-choice, true-false, or multiple-select)
      3. 2-5 answer options
      4. The correct answer(s)
      
      Format the response as a JSON array with the following structure:
      [
        {
          "text": "Question text",
          "type": "multiple-choice", // or "true-false" or "multiple-select"
          "options": [
            {"id": "opt1", "text": "Option 1"},
            {"id": "opt2", "text": "Option 2"},
            ...
          ],
          "correctAnswers": ["opt1"] // Array of option IDs that are correct
        },
        ...
      ]
    `

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || "Failed to generate questions" },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Extract the generated text
    const generatedText = data.candidates[0].content.parts[0].text

    // Parse the JSON from the generated text
    // This is a bit tricky as we need to extract the JSON part from the text
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse generated questions" }, { status: 500 })
    }

    let questions
    try {
      questions = JSON.parse(jsonMatch[0])
    } catch (error) {
      return NextResponse.json({ error: "Failed to parse generated questions JSON" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Questions generated successfully",
      questions,
    })
  } catch (error) {
    console.error("Question Generation Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

