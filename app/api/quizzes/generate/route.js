import connect from '@/dbConfig/dbConfig'
import { authenticateUser } from '@/middleware/authMiddleware'
import { NextResponse } from 'next/server'

// Connect to the database
connect()

export async function POST (request) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Extract request body
    const reqBody = await request.json()
    const { prompt, numQuestions = 5, subject } = reqBody

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing.')
      return NextResponse.json(
        { error: 'Gemini API is not configured' },
        { status: 500 }
      )
    }

    console.log('✔ Using Gemini API Key')

    // Construct API request
    const promptText = `
      Generate ${numQuestions} quiz questions about ${prompt} for ${
      subject || 'general knowledge'
    }.
      Format the response as a JSON array:
      [
        {
          "text": "Question text",
          "type": "multiple-choice",
          "options": [
            { "id": "opt1", "text": "Option 1" },
            { "id": "opt2", "text": "Option 2" }
          ],
          "correctAnswers": ["opt1"]
        }
      ]
    `

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }]
        }
      ]
    }

    console.log('Sending request to Gemini API...')

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error(
        '❌ Gemini API Error:',
        response.status,
        response.statusText
      )
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✔ Gemini API Response:', JSON.stringify(data, null, 2))

    // Extract the generated text
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to extract JSON from AI response' },
        { status: 500 }
      )
    }

    let questions
    try {
      questions = JSON.parse(jsonMatch[0])
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format in AI response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Questions generated successfully',
      questions
    })
  } catch (error) {
    console.error('❌ Error generating questions:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
