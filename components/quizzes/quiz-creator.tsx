"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface Question {
  id: string
  text: string
  type: "multiple-choice" | "true-false" | "multiple-select"
  options: { id: string; text: string }[]
  correctAnswers: string[]
}

export default function QuizCreator() {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    subject: "",
    timeLimit: 0,
    isPublic: true,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    text: "",
    type: "multiple-choice",
    options: [
      { id: "opt1", text: "" },
      { id: "opt2", text: "" },
    ],
    correctAnswers: [],
  })
  const [activeTab, setActiveTab] = useState("manual")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState("")

  const handleQuizDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setQuizData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setQuizData((prev) => ({ ...prev, isPublic: checked }))
  }

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentQuestion((prev) => ({ ...prev, text: e.target.value }))
  }

  const handleQuestionTypeChange = (value: string) => {
    let newOptions = currentQuestion.options
    const newCorrectAnswers: string[] = []

    if (value === "true-false") {
      newOptions = [
        { id: "opt1", text: "True" },
        { id: "opt2", text: "False" },
      ]
    } else if (currentQuestion.type === "true-false") {
      newOptions = [
        { id: "opt1", text: "" },
        { id: "opt2", text: "" },
      ]
    }

    setCurrentQuestion((prev) => ({
      ...prev,
      type: value as "multiple-choice" | "true-false" | "multiple-select",
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    }))
  }

  const handleOptionChange = (id: string, value: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, text: value } : opt)),
    }))
  }

  const addOption = () => {
    const newOptionId = `opt${currentQuestion.options.length + 1}`
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { id: newOptionId, text: "" }],
    }))
  }

  const removeOption = (id: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
      correctAnswers: prev.correctAnswers.filter((answerId) => answerId !== id),
    }))
  }

  const handleCorrectAnswerChange = (id: string, isChecked: boolean) => {
    if (currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false") {
      setCurrentQuestion((prev) => ({
        ...prev,
        correctAnswers: isChecked ? [id] : [],
      }))
    } else {
      setCurrentQuestion((prev) => ({
        ...prev,
        correctAnswers: isChecked
          ? [...prev.correctAnswers, id]
          : prev.correctAnswers.filter((answerId) => answerId !== id),
      }))
    }
  }

  const addQuestion = () => {
    if (!currentQuestion.text.trim() || currentQuestion.correctAnswers.length === 0) {
      alert("Please fill in the question text and select at least one correct answer")
      return
    }

    const newQuestion = {
      ...currentQuestion,
      id: `q${Date.now()}`,
    }

    setQuestions((prev) => [...prev, newQuestion])

    // Reset current question
    setCurrentQuestion({
      id: "",
      text: "",
      type: "multiple-choice",
      options: [
        { id: "opt1", text: "" },
        { id: "opt2", text: "" },
      ],
      correctAnswers: [],
    })
  }

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const generateQuestions = async () => {
    if (!generationPrompt.trim()) {
      alert("Please enter a topic or description for the quiz")
      return
    }

    setIsGenerating(true)

    try {
      // In a real app, this would be an API call to Gemini
      // For this demo, we'll simulate a response after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock generated questions
      const generatedQuestions: Question[] = [
        {
          id: `q${Date.now()}`,
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
          id: `q${Date.now() + 1}`,
          text: "The Earth revolves around the Sun.",
          type: "true-false",
          options: [
            { id: "opt1", text: "True" },
            { id: "opt2", text: "False" },
          ],
          correctAnswers: ["opt1"],
        },
        {
          id: `q${Date.now() + 2}`,
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
      ]

      setQuestions((prev) => [...prev, ...generatedQuestions])
      setGenerationPrompt("")
    } catch (error) {
      console.error("Error generating questions:", error)
      alert("Failed to generate questions. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const saveQuiz = () => {
    if (!quizData.title.trim()) {
      alert("Please enter a quiz title")
      return
    }

    if (questions.length === 0) {
      alert("Please add at least one question to the quiz")
      return
    }

    const quiz = {
      ...quizData,
      questions,
      createdAt: new Date().toISOString(),
    }

    // In a real app, you would save this to your backend
    console.log("Saving quiz:", quiz)

    // Reset form
    setQuizData({
      title: "",
      description: "",
      subject: "",
      timeLimit: 0,
      isPublic: true,
    })
    setQuestions([])
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Create Quiz</h2>
        <p className="text-sm text-muted-foreground">Create a new quiz for your students or peers.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizDataChange}
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={quizData.subject}
                  onChange={handleQuizDataChange}
                  placeholder="e.g., Mathematics, Science, History"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={quizData.description}
                onChange={handleQuizDataChange}
                placeholder="Describe what this quiz is about"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes, 0 for no limit)</Label>
                <Input
                  id="timeLimit"
                  name="timeLimit"
                  type="number"
                  min="0"
                  value={quizData.timeLimit}
                  onChange={handleQuizDataChange}
                />
              </div>
              <div className="flex items-center justify-between space-x-2 pt-6">
                <Label htmlFor="isPublic">Make Quiz Public</Label>
                <Switch id="isPublic" checked={quizData.isPublic} onCheckedChange={handleSwitchChange} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold">Add Questions</h3>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="ai">AI Generated</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-text">Question</Label>
                    <Textarea
                      id="question-text"
                      value={currentQuestion.text}
                      onChange={handleQuestionTextChange}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question-type">Question Type</Label>
                    <Select value={currentQuestion.type} onValueChange={handleQuestionTypeChange}>
                      <SelectTrigger id="question-type">
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice (Single Answer)</SelectItem>
                        <SelectItem value="multiple-select">Multiple Choice (Multiple Answers)</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Answer Options</Label>
                      {currentQuestion.type !== "true-false" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          disabled={currentQuestion.options.length >= 6}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      )}
                    </div>

                    {currentQuestion.type === "multiple-choice" || currentQuestion.type === "true-false" ? (
                      <RadioGroup
                        value={currentQuestion.correctAnswers[0] || ""}
                        onValueChange={(value) => handleCorrectAnswerChange(value, true)}
                      >
                        {currentQuestion.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2 space-y-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Input
                              value={option.text}
                              onChange={(e) => handleOptionChange(option.id, e.target.value)}
                              placeholder="Enter option text"
                              disabled={currentQuestion.type === "true-false"}
                              className="flex-1"
                            />
                            {currentQuestion.type !== "true-false" && currentQuestion.options.length > 2 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(option.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-2">
                        {currentQuestion.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.id}
                              checked={currentQuestion.correctAnswers.includes(option.id)}
                              onCheckedChange={(checked) => handleCorrectAnswerChange(option.id, checked as boolean)}
                            />
                            <Input
                              value={option.text}
                              onChange={(e) => handleOptionChange(option.id, e.target.value)}
                              placeholder="Enter option text"
                              className="flex-1"
                            />
                            {currentQuestion.options.length > 2 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(option.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={addQuestion}
                    disabled={!currentQuestion.text.trim() || currentQuestion.correctAnswers.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">Describe the quiz you want to create</Label>
                    <Textarea
                      id="ai-prompt"
                      value={generationPrompt}
                      onChange={(e) => setGenerationPrompt(e.target.value)}
                      placeholder="e.g., Create a 5-question quiz about the solar system for middle school students"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={generateQuestions}
                    disabled={isGenerating || !generationPrompt.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Questions with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quiz Questions ({questions.length})</h3>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="font-medium">
                        Question {index + 1}: {question.text}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Type:{" "}
                        {question.type === "multiple-choice"
                          ? "Multiple Choice (Single Answer)"
                          : question.type === "multiple-select"
                            ? "Multiple Choice (Multiple Answers)"
                            : "True/False"}
                      </p>
                      <div className="mt-2 space-y-1">
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center">
                            <div className="w-5 h-5 mr-2 flex items-center justify-center">
                              {question.correctAnswers.includes(option.id) ? (
                                <div className="w-3 h-3 rounded-full bg-primary" />
                              ) : null}
                            </div>
                            <span
                              className={
                                question.correctAnswers.includes(option.id) ? "font-medium" : "text-muted-foreground"
                              }
                            >
                              {option.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(question.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={saveQuiz} disabled={!quizData.title.trim() || questions.length === 0}>
          Save Quiz
        </Button>
      </div>
    </div>
  )
}

