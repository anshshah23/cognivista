import connect from "@/dbConfig/dbConfig";
import { authenticateUser } from "@/middleware/authMiddleware";
import Collaboration from "@/models/collaborationModel";
import { NextResponse } from "next/server";

// Connect to the database
connect();

// Get messages for a collaboration session
export async function GET(request, context) {
  try {
    const auth = await authenticateUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.user;
    const { sessionId } = context.params; // ✅ Fixed extraction

    const session = await Collaboration.findOne({ sessionId }).populate("messages.user", "username");

    if (!session) {
      return NextResponse.json({ error: "Collaboration session not found" }, { status: 404 });
    }

    // Check if user has access to this session
    const isOwner = session.owner.toString() === user._id.toString();
    const isParticipant = session.participants.some((p) => p.toString() === user._id.toString());

    if (!isOwner && !isParticipant) {
      return NextResponse.json(
        { error: "You don't have permission to view messages for this session" },
        { status: 403 }
      );
    }

    return NextResponse.json({ messages: session.messages });
  } catch (error) {
    console.error("Collaboration Messages Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// Add a message to a collaboration session
export async function POST(request, context) {
  try {
    const auth = await authenticateUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.user;
    const { sessionId } = context.params; // ✅ Fixed extraction
    const reqBody = await request.json();
    const { text } = reqBody;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const session = await Collaboration.findOne({ sessionId });

    if (!session) {
      return NextResponse.json({ error: "Collaboration session not found" }, { status: 404 });
    }

    // Check if user has access to this session
    const isOwner = session.owner.toString() === user._id.toString();
    const isParticipant = session.participants.some((p) => p.toString() === user._id.toString());

    if (!isOwner && !isParticipant) {
      return NextResponse.json({ error: "You don't have permission to send messages in this session" }, { status: 403 });
    }

    // Add the message
    const newMessage = {
      user: user._id,
      text,
    };

    session.messages.push(newMessage);

    // Update last activity
    session.lastActivity = new Date();

    await session.save();

    // Populate user info for the new message
    const populatedSession = await Collaboration.findOne({ sessionId }).populate("messages.user", "username");

    const addedMessage = populatedSession.messages[populatedSession.messages.length - 1];

    return NextResponse.json({
      message: "Message sent successfully",
      chatMessage: addedMessage,
    });
  } catch (error) {
    console.error("Collaboration Message Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
