import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires in 5 minutes
});

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
