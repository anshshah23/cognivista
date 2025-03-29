import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Image,
  MessageSquare,
  PenTool,
  Video,
  BarChart,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Lightbulb,
} from "lucide-react"

export default function Home() {
  const features = [
    {
      title: "Interactive Whiteboard",
      description: "Create, save, and collaborate on digital whiteboards in real-time",
      icon: PenTool,
      href: "/whiteboard",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Image-Based Learning",
      description: "Upload and annotate images for visual learning",
      icon: Image,
      href: "/image-learning",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Video Learning",
      description: "Watch educational videos with note-taking capabilities",
      icon: Video,
      href: "/video",
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Quizzes & Assessments",
      description: "Test your knowledge with interactive quizzes",
      icon: BookOpen,
      href: "/quizzes",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Live Collaboration",
      description: "Work together in real-time with peers and instructors",
      icon: MessageSquare,
      href: "/collaboration",
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      title: "Analytics Dashboard",
      description: "Track your productivity and learning progress",
      icon: BarChart,
      href: "/analytics",
      color: "bg-indigo-500/10 text-indigo-500",
    },
  ]

  const benefits = [
    {
      title: "Personalized Learning",
      description: "Adaptive content that adjusts to your learning style and pace",
      icon: Sparkles,
    },
    {
      title: "Collaborative Environment",
      description: "Learn together with peers through shared workspaces",
      icon: Users,
    },
    {
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics",
      icon: Award,
    },
    {
      title: "Interactive Content",
      description: "Engage with material through multiple learning modalities",
      icon: Lightbulb,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Interactive Learning Platform for Modern Education
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Engage, collaborate, and learn with our comprehensive suite of educational tools designed for students
                and educators.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/whiteboard">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/analytics">View Analytics</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-muted">
              <img
                src="/placeholder.svg?height=500&width=800"
                alt="Educational platform dashboard"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comprehensive Learning Tools
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform offers a variety of interactive tools to enhance your learning experience.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href={feature.href}>
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Our Platform</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover the benefits of our integrated educational ecosystem.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Learning Experience?
              </h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of students and educators already using our platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

