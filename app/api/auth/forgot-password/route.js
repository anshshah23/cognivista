import connect from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import OTP from "@/models/otpModel";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

connect();

export async function POST(req) {
    try {
        const { email, otp, newPassword } = await req.json();
        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 404 });
        }

        // Validate OTP
        const validOtp = await OTP.findOne({ email, otp });
        if (!validOtp) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // Hash new password and update user
        user.password = bcrypt.hashSync(newPassword, 10);
        await user.save();

        // Delete OTP after successful reset
        await OTP.deleteOne({ email });

        return NextResponse.json({ message: "Password reset successful" }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
