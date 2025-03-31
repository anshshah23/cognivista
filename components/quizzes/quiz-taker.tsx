"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import analyticsTracker from "@/lib/analytics"

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  type: "multiple-choice" | "true-false" | "multiple-select"
  options: Option[]
  correctAnswers: string[]
}

interface QuizTakerProps {
  quiz: {
    _id: string
    title: string
    description: string
    timeLimit: number
    questions: Question[]
  }
  isOpen: boolean
  onClose: () => void
}

export default function QuizTaker({ quiz, isOpen, onClose }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  // Record analytics when quiz starts
  useEffect(() => {
    if (isOpen) {
      analyticsTracker.recordAction()
    }
  }, [isOpen])

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

  // Reset state when quiz changes
  useEffect(() => {
    if (quiz) {
      setCurrentQuestionIndex(0)
      setAnswers({})
      setTimeRemaining(quiz.timeLimit * 60)
      setQuizCompleted(false)
      setScore({ correct: 0, total: quiz.questions.length, percentage: 0 })
    }
  }, [quiz])

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
    if (currentQuestionIndex < quiz.questions.length - 1) {
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

  const submitQuiz = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    analyticsTracker.recordAction()

    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptions]) => ({
        questionId,
        selectedOptions,
      }))

      // Submit to API
      const response = await fetch(`/api/quizzes/${quiz._id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          timeSpent: quiz.timeLimit * 60 - timeRemaining,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz")
      }

      const data = await response.json()

      // Set result and score
      setResult(data.result)
      setScore({
        correct: data.result.score,
        total: data.result.totalQuestions,
        percentage: data.result.percentage,
      })

      setQuizCompleted(true)
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setTimeRemaining(quiz.timeLimit * 60)
    setQuizCompleted(false)
    setResult(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-sm border">
        {!quizCompleted ? (
          <>
            <DialogHeader>
              <DialogTitle>{quiz.title}</DialogTitle>
              <DialogDescription>{quiz.description}</DialogDescription>
            </DialogHeader>

            <div className="flex justify-between items-center">
              <div className="text-sm">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </div>
              {quiz.timeLimit > 0 && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Time remaining: {formatTime(timeRemaining)}
                </div>
              )}
            </div>

            <Progress value={progress} className="h-2" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
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
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-background/80 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="default"
                onClick={goToNextQuestion}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : isSubmitting ? (
                  "Submitting..."
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
              <motion.div
                className="text-center mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{score.percentage}%</span>
                  </div>
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle
                      className="text-muted stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - score.percentage / 100)}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mt-2">
                  {score.correct} / {score.total} Correct
                </h2>
                <p className="text-muted-foreground">
                  {score.percentage >= 80
                    ? "Excellent work!"
                    : score.percentage >= 60
                      ? "Good job!"
                      : "Keep practicing!"}
                </p>
              </motion.div>

              <div className="w-full max-w-md space-y-4">
                {result &&
                  result.answers &&
                  result.answers.map((answer: any, index: number) => {
                    const question = quiz.questions.find((q) => q.id === answer.questionId)
                    if (!question) return null

                    return (
                      <motion.div
                        key={answer.questionId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`p-3 rounded-md ${
                          answer.isCorrect
                            ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                            : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                        }`}
                      >
                        <p className="font-medium">
                          {index + 1}. {question.text}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          {question.options.map((option) => {
                            const isSelected = answer.selectedOptions.includes(option.id)
                            const isCorrect = question.correctAnswers.includes(option.id)

                            return (
                              <div key={option.id} className="flex items-start">
                                <div className="mt-0.5 mr-2 w-4 h-4 flex-shrink-0">
                                  {isSelected && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                  {isSelected && !isCorrect && <div className="w-4 h-4 rounded-full bg-red-500" />}
                                  {!isSelected && isCorrect && (
                                    <div className="w-4 h-4 rounded-full border-2 border-green-500" />
                                  )}
                                </div>
                                <span className={`${isCorrect ? "font-medium" : ""}`}>{option.text}</span>
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-sm mt-1">
                          {answer.isCorrect ? (
                            <span className="text-green-600 dark:text-green-400">Correct</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Incorrect</span>
                          )}
                        </p>
                      </motion.div>
                    )
                  })}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose} className="bg-background/80 backdrop-blur-sm">
                Close
              </Button>
              <Button
                variant="default"
                onClick={restartQuiz}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                Restart Quiz
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

