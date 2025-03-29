import connect from '@/dbConfig/dbConfig'
import { authenticateUser } from '@/middleware/authMiddleware'
import Profile from '@/models/profileModel'
import User from '@/models/userModel'
import { NextResponse } from 'next/server'

// Connect to the database
connect()

// Get user profile
export async function GET (request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user

    // Find profile or create if it doesn't exist
    let profile = await Profile.findOne({ user: user._id })

    if (!profile) {
      profile = new Profile({ user: user._id })
      await profile.save()
    }

    return NextResponse.json({
      profile: {
        ...profile.toObject(),
        username: user.username,
        email: user.email,
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        theme: profile.theme || 'system'
      }
    })
  } catch (error) {
    console.error('Profile Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Update user profile
export async function PUT (request) {
  try {
    const auth = await authenticateUser(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const user = auth.user
    const reqBody = await request.json()

    // Find profile or create if it doesn't exist
    let profile = await Profile.findOne({ user: user._id })

    if (!profile) {
      profile = new Profile({ user: user._id })
    }

    // Update profile fields
    if (reqBody.bio !== undefined) profile.bio = reqBody.bio
    if (reqBody.avatar !== undefined) profile.avatar = reqBody.avatar
    if (reqBody.theme !== undefined) profile.theme = reqBody.theme

    // Update notification settings if provided
    if (reqBody.notifications) {
      if (reqBody.notifications.email) {
        Object.assign(profile.notifications.email, reqBody.notifications.email)
      }
      if (reqBody.notifications.push) {
        Object.assign(profile.notifications.push, reqBody.notifications.push)
      }
    }

    await profile.save()

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        ...profile.toObject(),
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Profile Update Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    await connect();

    const auth = await authenticateUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.user;

    // Clear the auth cookie
    const response = NextResponse.json({
      message: "Account deleted successfully",
      success: true,
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    const userDeleted = await User.findByIdAndDelete(user._id);
    if (!userDeleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return response;
  } catch (error) {
    console.error("Account Deletion Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
