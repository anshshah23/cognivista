export const metadata = {
  title: "Signup - CogniVIsta",
  description: "Create a new account on CogniVIsta",
}

import SignupForm from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="container flex h-screen items-center justify-center">
      <SignupForm />
    </div>
  )
}

