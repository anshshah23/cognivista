export const metadata = {
  title: "Login - CogniVIsta",
  description: "Login to access your CogniVIsta account",
}

import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="container flex h-screen items-center justify-center">
      <LoginForm />
    </div>
  )
}

