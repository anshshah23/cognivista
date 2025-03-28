"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"

// Mock questions for the quiz
const mockQuestions = [
  {
    id: "q1",
    text: "What is the capital of France?",
    type: "multiple-choice",
    options: [
      { id: "opt1", text: "London" },
      { id: "opt2", text: "Berlin" },
      { id: "opt3", text: "Paris" },
      { id: "opt4", text: "Madrid" },
    ],
    correctAnswers: ["opt3"],
  },
  {
    id: "q2",
    text: "The Earth revolves around the Sun.",
    type: "true-false",
    options: [
      { id: "opt1", text: "True" },
      { id: "opt2", text: "False" },
    ],
    correctAnswers: ["opt1"],
  },
  {
    id: "q3",
    text: "Which of the following are primary colors?",
    type: "multiple-select",
    options: [
      { id: "opt1", text: "Red" },
      { id: "opt2", text: "Green" },
      { id: "opt3", text: "Blue" },
      { id: "opt4", text: "Yellow" },
    ],
    correctAnswers: ["opt1", "opt3", "opt4"],
  },
  {
    id: "q4",
    text: "What is the chemical symbol for water?",
    type: "multiple-choice",
    options: [
      { id: "opt1", text: "WA" },
      { id: "opt2", text: "H2O" },
      { id: "opt3", text: "CO2" },
      { id: "opt4", text: "O2" },
    ],
    correctAnswers: ["opt2"],
  },
  {
    id: "q5",
    text: "Which of the following are planets in our solar system?",
    type: "multiple-select",
    options: [
      { id: "opt1", text: "Earth" },
      { id: "opt2", text: "Moon" },
      { id: "opt3", text: "Mars" },
      { id: "opt4", text: "Sun" },
    ],
    correctAnswers: ["opt1", "opt3"],
  },
]

interface QuizTakerProps {
  quiz: {
    id: string
    title: string
    description: string
    timeLimit: number
  }
  isOpen: boolean
  onClose: () => void
}

export default function QuizTaker({ quiz, isOpen, onClose }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: mockQuestions.length })

  const currentQuestion = mockQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100

  // Timer effect
  useEffect(() => {
    if (!isOpen || quizCompleted || !quiz.timeLimit) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          submitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, quizCompleted, quiz.timeLimit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleSingleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: [value],
    }))
  }

  const handleMultipleAnswerChange = (optionId: string, checked: boolean) => {
    setAnswers((prev) => {
      const currentAnswers = prev[currentQuestion.id] || []

      if (checked) {
        return {
          ...prev,
          [currentQuestion.id]: [...currentAnswers, optionId],
        }
      } else {
        return {
          ...prev,
          [currentQuestion.id]: currentAnswers.filter((id) => id !== optionId),
        }
      }
    })
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      submitQuiz()
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const submitQuiz = () => {
    // Calculate score
    let correctCount = 0

    mockQuestions.forEach((question) => {
      const userAnswers = answers[question.id] || []
      const correctAnswers = question.correctAnswers

      // Check if arrays have the same elements (regardless of order)
      const isCorrect =
        userAnswers.length === correctAnswers.length && userAnswers.every((answer) => correctAnswers.includes(answer))

      if (isCorrect) {
        correctCount++
      }
    })

    setScore({
      correct: correctCount,
      total: mockQuestions.length,
    })

    setQuizCompleted(true)
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeRemaining(quiz.timeLimit * 60)
    setQuizCompleted(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        {!quizCompleted ? (
          <>
            <DialogHeader>
              <DialogTitle>{quiz.title}</DialogTitle>
              <DialogDescription>{quiz.description}</DialogDescription>
            </DialogHeader>

            <div className="flex justify-between items-center">
              <div className="text-sm">
                Question {currentQuestionIndex + 1} of {mockQuestions.length}
              </div>
              {quiz.timeLimit > 0 && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Time remaining: {formatTime(timeRemaining)}
                </div>
              )}
            </div>

            <Progress value={progress} className="h-2" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">{currentQuestion.text}</h3>

              {currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false" ? (
                <RadioGroup
                  value={answers[currentQuestion.id]?.[0] || ""}
                  onValueChange={handleSingleAnswerChange}
                  className="space-y-2"
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id}>{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={(answers[currentQuestion.id] || []).includes(option.id)}
                        onCheckedChange={(checked) => handleMultipleAnswerChange(option.id, checked as boolean)}
                      />
                      <Label htmlFor={option.id}>{option.text}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button variant="default" onClick={goToNextQuestion}>
                {currentQuestionIndex < mockQuestions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Quiz Results</DialogTitle>
              <DialogDescription>You have completed the quiz!</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-2" />
                <h2 className="text-2xl font-bold">
                  {score.correct} / {score.total} Correct
                </h2>
                <p className="text-muted-foreground">Your score: {Math.round((score.correct / score.total) * 100)}%</p>
              </div>

              <div className="w-full max-w-md space-y-4">
                {mockQuestions.map((question, index) => {
                  const userAnswers = answers[question.id] || []
                  const isCorrect =
                    userAnswers.length === question.correctAnswers.length &&
                    userAnswers.every((answer) => question.correctAnswers.includes(answer))

                  return (
                    <div
                      key={question.id}
                      className={`p-3 rounded-md ${isCorrect ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}
                    >
                      <p className="font-medium">
                        {index + 1}. {question.text}
                      </p>
                      <p className="text-sm mt-1">
                        {isCorrect ? (
                          <span className="text-green-600 dark:text-green-400">Correct</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">Incorrect</span>
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="default" onClick={restartQuiz}>
                Restart Quiz
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

