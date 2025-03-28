"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Clock, Calendar, Play, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

// Mock data for quizzes
const mockQuizzes = [
  {
    id: "1",
    title: "Introduction to Mathematics",
    description: "Test your basic math knowledge with this quiz.",
    subject: "Mathematics",
    timeLimit: 15,
    isPublic: true,
    questions: 10,
    createdBy: "Professor Smith",
    createdAt: "2023-05-15",
    attempts: 245,
  },
  {
    id: "2",
    title: "Physics Fundamentals",
    description: "Test your understanding of basic physics concepts.",
    subject: "Physics",
    timeLimit: 20,
    isPublic: true,
    questions: 15,
    createdBy: "Dr. Johnson",
    createdAt: "2023-06-20",
    attempts: 187,
  },
  {
    id: "3",
    title: "Chemistry Basics",
    description: "A quiz covering fundamental chemistry concepts.",
    subject: "Chemistry",
    timeLimit: 30,
    isPublic: false,
    questions: 20,
    createdBy: "Dr. Martinez",
    createdAt: "2023-07-10",
    attempts: 132,
  },
  {
    id: "4",
    title: "Biology: Cell Structure",
    description: "Test your knowledge of cell structure and function.",
    subject: "Biology",
    timeLimit: 25,
    isPublic: true,
    questions: 12,
    createdBy: "Professor Wilson",
    createdAt: "2023-08-05",
    attempts: 198,
  },
  {
    id: "5",
    title: "Computer Science: Algorithms",
    description: "Test your understanding of basic algorithms.",
    subject: "Computer Science",
    timeLimit: 45,
    isPublic: true,
    questions: 15,
    createdBy: "Dr. Chen",
    createdAt: "2023-09-12",
    attempts: 156,
  },
  {
    id: "6",
    title: "History: Ancient Civilizations",
    description: "Test your knowledge of ancient civilizations.",
    subject: "History",
    timeLimit: 30,
    isPublic: true,
    questions: 25,
    createdBy: "Professor Adams",
    createdAt: "2023-10-18",
    attempts: 112,
  },
]

export default function QuizList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedQuiz, setSelectedQuiz] = useState<(typeof mockQuizzes)[0] | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)

  const filteredQuizzes = mockQuizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const deleteQuiz = (id: string) => {
    // In a real app, you would delete the quiz from your backend
    console.log("Deleting quiz:", id)
  }

  const startQuiz = (quiz: (typeof mockQuizzes)[0]) => {
    setSelectedQuiz(quiz)
    setIsQuizModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Quizzes</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search quizzes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground">No quizzes found matching your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold truncate">{quiz.title}</h3>
                  <Badge variant={quiz.isPublic ? "default" : "secondary"}>
                    {quiz.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{quiz.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{quiz.subject}</Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {quiz.timeLimit} min
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {quiz.createdAt}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span>By {quiz.createdBy}</span>
                  <span>{quiz.questions} questions</span>
                  <span>{quiz.attempts} attempts</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="default" size="sm" className="flex-1" onClick={() => startQuiz(quiz)}>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteQuiz(quiz.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedQuiz && (
        <QuizTaker quiz={selectedQuiz} isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} />
      )}
    </div>
  )
}

