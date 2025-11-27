"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Clock, Calendar, Play, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/authContext"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import QuizTaker from "@/components/quizzes/quiz-taker"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Quiz {
  _id: string
  title: string
  description: string
  subject: string
  timeLimit: number
  isPublic: boolean
  questions: any[]
  user: {
    _id: string
    username: string
  }
  createdAt: string
  attempts: number
}

export default function QuizList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/quizzes")
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes || [])
      } else {
        throw new Error("Failed to fetch quizzes")
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const deleteQuiz = async (id: string) => {
    try {
      const response = await fetch(`/api/quizzes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the quiz from the local state
        setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz._id !== id))

        toast({
          title: "Success",
          description: "Quiz deleted successfully",
        })
      } else {
        throw new Error("Failed to delete quiz")
      }
    } catch (error) {
      console.error("Error deleting quiz:", error)
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      })
    }
  }

  const startQuiz = async (quiz: Quiz) => {
    try {
      // Fetch the full quiz with questions
      const response = await fetch(`/api/quizzes/${quiz._id}`)

      if (response.ok) {
        const data = await response.json()
        setSelectedQuiz(data.quiz)
        setIsQuizModalOpen(true)
      } else {
        throw new Error("Failed to load quiz")
      }
    } catch (error) {
      console.error("Error loading quiz:", error)
      toast({
        title: "Error",
        description: "Failed to load quiz",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Quizzes</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search quizzes..."
            className="pl-8 bg-background/80 backdrop-blur-sm border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="bg-background/80 backdrop-blur-sm border">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">No quizzes found matching your search.</p>
            <Button
              className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden card-hover bg-background/80 backdrop-blur-sm border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate">{quiz.title}</h3>
                    <Badge
                      variant={quiz.isPublic ? "default" : "secondary"}
                      className={
                        quiz.isPublic
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white} className={quiz.isPublic ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : "bg-background/80 backdrop-blur-sm"
                      }
                    >
                      {quiz.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{quiz.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                      {quiz.subject}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {quiz.timeLimit} min
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>By {quiz.user.username}</span>
                    <span>{quiz.questions.length} questions</span>
                    <span>{quiz.attempts} attempts</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className={`${user && quiz.user._id === user._id ? "flex-1" : "w-full"} bg-gradient-to-r from-blue-500 to-purple-500 text-white`}
                      onClick={() => startQuiz(quiz)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                    {user && (user._id === quiz.user._id || user.isAdmin) && (
                      <>
                        <Button variant="outline" size="sm" className="flex-1 bg-background/80 backdrop-blur-sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-background/95 backdrop-blur-sm border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-background/80 backdrop-blur-sm">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteQuiz(quiz._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedQuiz && (
        <QuizTaker quiz={selectedQuiz} isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} />
      )}
    </motion.div>
  )
}

