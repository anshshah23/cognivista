"use client";

import { Link } from "lucide-react";
import { useState, useEffect } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError("");
        setMessage("");
    }, [step]);

    const handleSendOtp = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setStep(2); // Move to OTP verification step
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to send OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Password reset successful! Redirecting...");
                setTimeout(() => setStep(1), 3000); // Reset form after success
                setEmail("");
                setOtp("");
                setNewPassword("");
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to reset password. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Forgot Password</h2>
                <Link className="text-blue-500 text-sm mb-4" href="/login">Back to Login</Link>
                {step === 1 ? (
                    <>
                        <p className="text-gray-500 text-center mb-4">Enter your email to receive an OTP.</p>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" />
                        <button onClick={handleSendOtp} disabled={!email || loading} className="w-full py-3 bg-blue-600 text-white rounded-lg mt-3">{loading ? "Sending..." : "Send OTP"}</button>
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 border rounded-lg" />
                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border rounded-lg mt-2" />
                        <button onClick={handleVerifyOtp} disabled={!otp || !newPassword || loading} className="w-full py-3 bg-green-600 text-white rounded-lg mt-3">{loading ? "Verifying..." : "Reset Password"}</button>
                    </>
                )}

                {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
                {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            </div>
        </div>
    );
}
