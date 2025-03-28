import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BookOpen, Image, MessageSquare, PenTool, Video } from "lucide-react"

export default function Home() {
  const features = [
    {
      title: "Interactive Whiteboard",
      description: "Collaborate in real-time with an interactive whiteboard",
      icon: PenTool,
      href: "/whiteboard",
    },
    {
      title: "Image-Based Learning",
      description: "Upload and annotate images for visual learning",
      icon: Image,
      href: "/image-learning",
    },
    {
      title: "Paint Application",
      description: "Express creativity with our digital paint tools",
      icon: PenTool,
      href: "/paint",
    },
    {
      title: "Video Player",
      description: "Watch educational videos with note-taking capabilities",
      icon: Video,
      href: "/video",
    },
    {
      title: "Quizzes & Assessments",
      description: "Test your knowledge with interactive quizzes",
      icon: BookOpen,
      href: "/quizzes",
    },
    {
      title: "Live Collaboration",
      description: "Work together in real-time with peers and instructors",
      icon: MessageSquare,
      href: "/collaboration",
    },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Educational Platform</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          An interactive learning platform with collaborative features
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="mb-2 w-fit rounded-full bg-primary/10 p-2">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button asChild className="w-full">
                <Link href={feature.href}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

