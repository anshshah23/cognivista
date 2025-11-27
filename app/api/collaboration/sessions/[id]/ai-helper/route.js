import connect from "@/dbConfig/dbConfig"
import { authenticateUser } from "@/middleware/authMiddleware"
import Collaboration from "@/models/collaborationModel"
import AIHelperUsage from "@/models/aiHelperUsageModel"
import { NextResponse } from "next/server"

console.log("✅ AI Helper route loaded successfully")
connect()

// Helper function to get today's date string
function getTodayString() {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}

// GET - Check AI Helper usage/remaining prompts for today
export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = await params

    // Verify session exists and user has access
    const session = await Collaboration.findOne({ sessionId })
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found" 
      }, { status: 404 })
    }

    const hasAccess = session.owner.toString() === user._id.toString() || 
                     session.participants.some(p => p.toString() === user._id.toString())

    if (!hasAccess) {
      return NextResponse.json({ 
        success: false,
        error: "Access denied" 
      }, { status: 403 })
    }

    // Get or create usage record for today
    const today = getTodayString()
    let usage = await AIHelperUsage.findOne({
      user: user._id,
      session: session._id,
      date: today
    })

    if (!usage) {
      usage = {
        usageCount: 0,
        dailyLimit: 3
      }
    }

    const remaining = Math.max(0, usage.dailyLimit - usage.usageCount)

    return NextResponse.json({ 
      success: true,
      used: usage.usageCount,
      remaining,
      limit: usage.dailyLimit,
      date: today
    })
  } catch (error) {
    console.error("Get AI Usage Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}

// POST - Request AI Helper assistance
export async function POST(request, { params }) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const { id: sessionId } = await params
    const reqBody = await request.json()
    const { prompt, documentContent } = reqBody

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ 
        success: false,
        error: "Prompt is required" 
      }, { status: 400 })
    }

    if (prompt.length > 2000) {
      return NextResponse.json({ 
        success: false,
        error: "Prompt cannot exceed 2000 characters" 
      }, { status: 400 })
    }

    // Verify session exists and user has access
    const session = await Collaboration.findOne({ sessionId })
    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found" 
      }, { status: 404 })
    }

    const hasAccess = session.owner.toString() === user._id.toString() || 
                     session.participants.some(p => p.toString() === user._id.toString())

    if (!hasAccess) {
      return NextResponse.json({ 
        success: false,
        error: "Access denied" 
      }, { status: 403 })
    }

    // Check daily limit BEFORE making any API calls
    const today = getTodayString()
    let usage = await AIHelperUsage.findOne({
      user: user._id,
      session: session._id,
      date: today
    })

    if (!usage) {
      usage = new AIHelperUsage({
        user: user._id,
        session: session._id,
        date: today,
        usageCount: 0,
        dailyLimit: 3
      })
    }

    // EARLY RETURN: Check limit before API call to prevent quota waste
    if (usage.usageCount >= usage.dailyLimit) {
      return NextResponse.json({ 
        success: false,
        error: `Daily limit reached. You can use AI Helper ${usage.dailyLimit} times per day.`,
        remaining: 0,
        used: usage.usageCount,
        limit: usage.dailyLimit
      }, { status: 429 })
    }

    // Validate API key before proceeding
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing.')
      return NextResponse.json({ 
        success: false,
        error: "AI service is not configured" 
      }, { status: 500 })
    }

    // Sanitize inputs
    const sanitizedPrompt = prompt.trim()
    const sanitizedContent = documentContent ? documentContent.substring(0, 5000).trim() : ""

    // Log API call attempt for monitoring
    console.log(`🤖 AI Helper API call - User: ${user.username}, Session: ${sessionId}, Usage: ${usage.usageCount}/${usage.dailyLimit}`)

    // Call Gemini AI ONLY after all validations pass

    const systemPrompt = `You are a helpful AI assistant for collaborative document editing. 
You help users improve their documents, answer questions, and provide suggestions.
Keep responses concise and helpful. Current document content: ${sanitizedContent}`

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `User request: ${sanitizedPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Gemini API Error:', errorData)
        
        // Handle quota exceeded error specifically - DON'T increment usage
        if (response.status === 429) {
          return NextResponse.json({ 
            success: false,
            error: "🤖 AI Helper is temporarily unavailable due to quota limits. The chat and document editing still work normally!" 
          }, { status: 429 })
        }
        
        // Handle not found error - DON'T increment usage
        if (response.status === 404) {
          return NextResponse.json({ 
            success: false,
            error: "🤖 AI Helper model is currently unavailable. Please try again later!" 
          }, { status: 404 })
        }
        
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."

      // SUCCESS: Only increment usage count AFTER successful API response
      usage.usageCount += 1
      await usage.save()
      console.log(`✅ AI Helper successful - User: ${user.username}, New usage: ${usage.usageCount}/${usage.dailyLimit}`)

      // Add AI response to the document content
      const insertPosition = session.content.length
      const aiResponseSection = `\n\n--- AI Assistant Response ---\n${aiResponse}\n--- End AI Response ---\n`
      session.content = session.content + aiResponseSection

      // Add AI response as a message in the chat
      const aiMessage = {
        user: user._id,
        text: `🤖 AI Helper: Response added to document`,
      }
      session.messages.push(aiMessage)
      session.lastActivity = new Date()
      await session.save()
      await session.populate("messages.user", "username email")

      const chatMessage = session.messages[session.messages.length - 1]
      const remaining = Math.max(0, usage.dailyLimit - usage.usageCount)

      return NextResponse.json({ 
        success: true,
        message: "AI response added to document",
        response: aiResponse,
        chatMessage,
        documentUpdated: true,
        updatedContent: session.content,
        usage: {
          used: usage.usageCount,
          remaining,
          limit: usage.dailyLimit
        }
      })
    } catch (error) {
      // ERROR: Don't increment usage count for failed requests
      console.error(`❌ AI Helper failed - User: ${user.username}, Error: ${error.message}`)
      throw error
    }
  } catch (error) {
    console.error("AI Helper Error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}
