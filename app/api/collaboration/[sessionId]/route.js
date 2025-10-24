import connect from "@/dbConfig/dbConfig";
import { authenticateUser } from "@/middleware/authMiddleware";
import Collaboration from "@/models/collaborationModel";
import { NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";

// Connect to the database
connect();

// Input validation and sanitization
function validateAndSanitizeInput(title, content) {
  const errors = []
  
  // Validate title
  if (title && typeof title !== 'string') {
    errors.push('Title must be a string')
  }
  if (title && title.length > 200) {
    errors.push('Title cannot exceed 200 characters')
  }
  
  // Validate content
  if (content && typeof content !== 'string') {
    errors.push('Content must be a string')
  }
  if (content && content.length > 50000) {
    errors.push('Content cannot exceed 50,000 characters')
  }
  
  // Sanitize inputs to prevent XSS
  const sanitizedTitle = title ? DOMPurify.sanitize(title, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) : undefined
  const sanitizedContent = content ? DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) : undefined
  
  return {
    errors,
    sanitizedTitle,
    sanitizedContent
  }
}

// Get a specific collaboration session
export async function GET(request, context) {
  try {
    const auth = await authenticateUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.user;
    const { sessionId } = context.params; // ❌ Removed 'await', as params is synchronous

    const session = await Collaboration.findOne({ sessionId })
      .populate("owner", "username")
      .populate("participants", "username")
      .populate("messages.user", "username");

    if (!session) {
      return NextResponse.json({ error: "Collaboration session not found" }, { status: 404 });
    }

    // Check if user has access
    const isOwner = session.owner._id.toString() === user._id.toString();
    const isParticipant = session.participants.some((p) => p._id.toString() === user._id.toString());

    if (!isOwner && !isParticipant) {
      session.participants.push(user._id);
      await session.save();
    }

    session.lastActivity = new Date();
    await session.save();

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Collaboration Session Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// Update a collaboration session
export async function PUT(request, context) {
  try {
    const auth = await authenticateUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.user;
    const { sessionId } = context.params; // ❌ Removed 'await'
    const reqBody = await request.json();
    const { title, content } = reqBody;

    // Validate and sanitize input
    const validation = validateAndSanitizeInput(title, content)
    if (validation.errors.length > 0) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 })
    }

    const session = await Collaboration.findOne({ sessionId });

    if (!session) {
      return NextResponse.json({ error: "Collaboration session not found" }, { status: 404 });
    }

    const isOwner = session.owner.toString() === user._id.toString();
    const isParticipant = session.participants.some((p) => p.toString() === user._id.toString());

    if (!isOwner && !isParticipant) {
      return NextResponse.json({ error: "You don't have permission to update this session" }, { status: 403 });
    }

    if (validation.sanitizedTitle !== undefined) session.title = validation.sanitizedTitle;
    if (validation.sanitizedContent !== undefined) session.content = validation.sanitizedContent;
    session.lastActivity = new Date();

    await session.save();

    return NextResponse.json({
      message: "Collaboration session updated successfully",
      session,
    });
  } catch (error) {
    console.error("Collaboration Update Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// Delete a collaboration session
export async function DELETE(request, context) {
  try {
    const auth = await authenticateUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.user;
    const { sessionId } = context.params; // ❌ Removed 'await'

    const session = await Collaboration.findOne({ sessionId });

    if (!session) {
      return NextResponse.json({ error: "Collaboration session not found" }, { status: 404 });
    }

    if (session.owner.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json({ error: "You don't have permission to delete this session" }, { status: 403 });
    }

    await Collaboration.findOneAndDelete({ sessionId });

    return NextResponse.json({
      message: "Collaboration session deleted successfully",
    });
  } catch (error) {
    console.error("Collaboration Delete Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
