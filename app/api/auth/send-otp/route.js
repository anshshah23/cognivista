import connect from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import OTP from "@/models/otpModel";
import { NextResponse } from "next/server";
import { generateOtp, sendEmail } from "@/utils/otpUtils"; // Helper functions

connect();

export async function POST(req) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 404 });
        }

        // OTP request limit (3 per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const otpRequests = await OTP.countDocuments({ email, createdAt: { $gte: oneHourAgo } });

        if (otpRequests >= 3) {
            return NextResponse.json({ error: "Too many OTP requests. Try again later." }, { status: 429 });
        }

        // Generate and store new OTP
        const otpCode = generateOtp();
        await OTP.deleteOne({ email }); // Remove previous OTP
        await OTP.create({ email, otp: otpCode });

        // Send OTP via email
        await sendEmail(email, otpCode);

        return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });

    } catch (error) {
        console.error("OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
