import nodemailer from "nodemailer";

export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}
export async function sendEmail(email, otpCode) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your CogniVista OTP Code",
        text: `Your OTP code is ${otpCode}. It is valid for 5 minutes.`,
    };

    return transporter.sendMail(mailOptions);
}
