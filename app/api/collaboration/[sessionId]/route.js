import connect from "@/dbConfig/dbConfig";
import { authenticateUser } from "@/middleware/authMiddleware";
import Collaboration from "@/models/collaborationModel";
import { NextResponse } from "next/server";

// Connect to the database
connect();

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

    const session = await Collaboration.findOne({ sessionId });

    if (!session) {
      return NextResponse.json({ error: "Collaboration session not found" }, { status: 404 });
    }

    const isOwner = session.owner.toString() === user._id.toString();
    const isParticipant = session.participants.some((p) => p.toString() === user._id.toString());

    if (!isOwner && !isParticipant) {
      return NextResponse.json({ error: "You don't have permission to update this session" }, { status: 403 });
    }

    if (title !== undefined) session.title = title;
    if (content !== undefined) session.content = content;
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
