'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import analyticsTracker from '@/lib/analytics'

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'true-false' | 'multiple-select'
  options: Option[]
  correctAnswers: string[]
}

export default function QuizCreator () {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    timeLimit: 0,
    isPublic: true
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    text: '',
    type: 'multiple-choice',
    options: [
      { id: 'opt1', text: '' },
      { id: 'opt2', text: '' }
    ],
    correctAnswers: []
  })
  const [activeTab, setActiveTab] = useState('manual')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleQuizDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setQuizData(prev => ({ ...prev, [name]: value }))
  }

  const generateQuestions = async () => {
    if (!generationPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Enter a topic for the quiz',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generationPrompt,
          numQuestions: 5,
          subject: quizData.subject
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(prev => [...prev, ...data.questions])
        setQuizData(prev => ({
          ...prev,
          title: prev.title || 'Generated Quiz' // Set a default title if empty
        }))
        setGenerationPrompt('')
        toast({
          title: 'Success',
          description: `Generated ${data.questions.length} questions`
        })
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate questions',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const saveQuiz = async () => {
    if (!quizData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Enter a quiz title',
        variant: 'destructive'
      })
      return
    }

    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'Add at least one question',
        variant: 'destructive'
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quizData, questions })
      })

      if (!response.ok) {
        throw new Error('Failed to save quiz')
      }

      toast({ title: 'Success', description: 'Quiz created successfully' })
      setQuizData({
        title: '',
        description: '',
        subject: '',
        timeLimit: 0,
        isPublic: true
      })
      setQuestions([])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save quiz',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Start analytics tracking
  useEffect(() => {
    analyticsTracker.startSession('quizzes')

    return () => {
      analyticsTracker.endSession()
    }
  }, [])

  const handleSwitchChange = (checked: boolean) => {
    setQuizData(prev => ({ ...prev, isPublic: checked }))
  }

  const handleQuestionTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))
  }

  const handleQuestionTypeChange = (value: string) => {
    let newOptions = currentQuestion.options
    const newCorrectAnswers: string[] = []

    if (value === 'true-false') {
      newOptions = [
        { id: 'opt1', text: 'True' },
        { id: 'opt2', text: 'False' }
      ]
    } else if (currentQuestion.type === 'true-false') {
      newOptions = [
        { id: 'opt1', text: '' },
        { id: 'opt2', text: '' }
      ]
    }

    setCurrentQuestion(prev => ({
      ...prev,
      type: value as 'multiple-choice' | 'true-false' | 'multiple-select',
      options: newOptions,
      correctAnswers: newCorrectAnswers
    }))
  }

  const handleOptionChange = (id: string, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === id ? { ...opt, text: value } : opt
      )
    }))
  }

  const addOption = () => {
    const newOptionId = `opt${currentQuestion.options.length + 1}`
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { id: newOptionId, text: '' }]
    }))
  }

  const removeOption = (id: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== id),
      correctAnswers: prev.correctAnswers.filter(answerId => answerId !== id)
    }))
  }

  const handleCorrectAnswerChange = (id: string, isChecked: boolean) => {
    if (
      currentQuestion.type === 'multiple-choice' ||
      currentQuestion.type === 'true-false'
    ) {
      setCurrentQuestion(prev => ({
        ...prev,
        correctAnswers: isChecked ? [id] : []
      }))
    } else {
      setCurrentQuestion(prev => ({
        ...prev,
        correctAnswers: isChecked
          ? [...prev.correctAnswers, id]
          : prev.correctAnswers.filter(answerId => answerId !== id)
      }))
    }
  }

  const addQuestion = () => {
    if (
      !currentQuestion.text.trim() ||
      currentQuestion.correctAnswers.length === 0
    ) {
      toast({
        title: 'Validation Error',
        description:
          'Please fill in the question text and select at least one correct answer',
        variant: 'destructive'
      })
      return
    }

    const newQuestion = {
      ...currentQuestion,
      id: `q${Date.now()}`
    }

    setQuestions(prev => [...prev, newQuestion])
    analyticsTracker.recordAction()

    // Reset current question
    setCurrentQuestion({
      id: '',
      text: '',
      type: 'multiple-choice',
      options: [
        { id: 'opt1', text: '' },
        { id: 'opt2', text: '' }
      ],
      correctAnswers: []
    })
  }

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  return (
    <motion.div
      className='space-y-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h2 className='text-xl font-semibold'>Create Quiz</h2>
        <p className='text-sm text-muted-foreground'>
          Create a new quiz for your students or peers.
        </p>
      </div>

      <Card className='bg-background/80 backdrop-blur-sm border'>
        <CardContent className='pt-6'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Quiz Title</Label>
                <Input
                  id='title'
                  name='title'
                  value={quizData.title}
                  onChange={handleQuizDataChange}
                  placeholder='Enter quiz title'
                  className='bg-background/80 backdrop-blur-sm border'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='subject'>Subject</Label>
                <Input
                  id='subject'
                  name='subject'
                  value={quizData.subject}
                  onChange={handleQuizDataChange}
                  placeholder='e.g., Mathematics, Science, History'
                  className='bg-background/80 backdrop-blur-sm border'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                name='description'
                value={quizData.description}
                onChange={handleQuizDataChange}
                placeholder='Describe what this quiz is about'
                className='bg-background/80 backdrop-blur-sm border'
                rows={3}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='timeLimit'>
                  Time Limit (minutes, 0 for no limit)
                </Label>
                <Input
                  id='timeLimit'
                  name='timeLimit'
                  type='number'
                  min='0'
                  value={quizData.timeLimit}
                  onChange={handleQuizDataChange}
                  className='bg-background/80 backdrop-blur-sm border'
                />
              </div>
              <div className='flex items-center justify-between space-x-2 pt-6'>
                <Label htmlFor='isPublic'>Make Quiz Public</Label>
                <Switch
                  id='isPublic'
                  checked={quizData.isPublic}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className='text-lg font-semibold'>Add Questions</h3>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full mt-2'
        >
          <TabsList className='bg-background/80 backdrop-blur-sm border'>
            <TabsTrigger
              value='manual'
              className='data-[state=active]:bg-primary/10 data-[state=active]:text-primary'
            >
              Manual Entry
            </TabsTrigger>
            <TabsTrigger
              value='ai'
              className='data-[state=active]:bg-primary/10 data-[state=active]:text-primary'
            >
              AI Generated
            </TabsTrigger>
          </TabsList>

          <TabsContent value='manual' className='space-y-4 mt-4'>
            <Card className='bg-background/80 backdrop-blur-sm border'>
              <CardContent className='pt-6'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='question-text'>Question</Label>
                    <Textarea
                      id='question-text'
                      value={currentQuestion.text}
                      onChange={handleQuestionTextChange}
                      placeholder='Enter your question'
                      className='bg-background/80 backdrop-blur-sm border'
                      rows={2}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='question-type'>Question Type</Label>
                    <Select
                      value={currentQuestion.type}
                      onValueChange={handleQuestionTypeChange}
                    >
                      <SelectTrigger
                        id='question-type'
                        className='bg-background/80 backdrop-blur-sm border'
                      >
                        <SelectValue placeholder='Select question type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='multiple-choice'>
                          Multiple Choice (Single Answer)
                        </SelectItem>
                        <SelectItem value='multiple-select'>
                          Multiple Choice (Multiple Answers)
                        </SelectItem>
                        <SelectItem value='true-false'>True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label>Answer Options</Label>
                      {currentQuestion.type !== 'true-false' && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={addOption}
                          disabled={currentQuestion.options.length >= 6}
                          className='bg-background/80 backdrop-blur-sm border'
                        >
                          <Plus className='h-4 w-4 mr-1' />
                          Add Option
                        </Button>
                      )}
                    </div>

                    {currentQuestion.type === 'multiple-choice' ||
                    currentQuestion.type === 'true-false' ? (
                      <RadioGroup
                        value={currentQuestion.correctAnswers[0] || ''}
                        onValueChange={value =>
                          handleCorrectAnswerChange(value, true)
                        }
                      >
                        {currentQuestion.options.map(option => (
                          <div
                            key={option.id}
                            className='flex items-center space-x-2 space-y-2'
                          >
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Input
                              value={option.text}
                              onChange={e =>
                                handleOptionChange(option.id, e.target.value)
                              }
                              placeholder='Enter option text'
                              disabled={currentQuestion.type === 'true-false'}
                              className='flex-1 bg-background/80 backdrop-blur-sm border'
                            />
                            {currentQuestion.type !== 'true-false' &&
                              currentQuestion.options.length > 2 && (
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => removeOption(option.id)}
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              )}
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className='space-y-2'>
                        {currentQuestion.options.map(option => (
                          <div
                            key={option.id}
                            className='flex items-center space-x-2'
                          >
                            <Checkbox
                              id={option.id}
                              checked={currentQuestion.correctAnswers.includes(
                                option.id
                              )}
                              onCheckedChange={checked =>
                                handleCorrectAnswerChange(
                                  option.id,
                                  checked as boolean
                                )
                              }
                            />
                            <Input
                              value={option.text}
                              onChange={e =>
                                handleOptionChange(option.id, e.target.value)
                              }
                              placeholder='Enter option text'
                              className='flex-1 bg-background/80 backdrop-blur-sm border'
                            />
                            {currentQuestion.options.length > 2 && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                onClick={() => removeOption(option.id)}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type='button'
                    onClick={addQuestion}
                    disabled={
                      !currentQuestion.text.trim() ||
                      currentQuestion.correctAnswers.length === 0
                    }
                    className='bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  >
                    <Plus className='h-4 w-4 mr-1' />
                    Add Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='ai' className='space-y-4 mt-4'>
            <Card className='bg-background/80 backdrop-blur-sm border'>
              <CardContent className='pt-6'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='ai-prompt'>
                      Describe the quiz you want to create
                    </Label>
                    <Textarea
                      id='ai-prompt'
                      value={generationPrompt}
                      onChange={e => setGenerationPrompt(e.target.value)}
                      placeholder='e.g., Create a 5-question quiz about the solar system for middle school students'
                      className='bg-background/80 backdrop-blur-sm border'
                      rows={3}
                    />
                  </div>

                  <Button
                    type='button'
                    onClick={generateQuestions}
                    disabled={isGenerating || !generationPrompt.trim()}
                    className='w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className='h-4 w-4 mr-2' />
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

      {questions.map((question, index) => (
        <motion.div
          key={question.id || `question-${index}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className='bg-background/80 backdrop-blur-sm border'>
            <CardContent className='p-4'>
              <div className='flex justify-between'>
                <div className='flex-1'>
                  <p className='font-medium'>
                    Question {index + 1}: {question.text}
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Type:{' '}
                    {question.type === 'multiple-choice'
                      ? 'Multiple Choice (Single Answer)'
                      : question.type === 'multiple-select'
                      ? 'Multiple Choice (Multiple Answers)'
                      : 'True/False'}
                  </p>
                  <div className='mt-2 space-y-1'>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={option.id || `option-${optionIndex}`}
                        className='flex items-center'
                      >
                        <div className='w-5 h-5 mr-2 flex items-center justify-center'>
                          {question.correctAnswers.includes(option.id) ? (
                            <div className='w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500' />
                          ) : null}
                        </div>
                        <span
                          className={
                            question.correctAnswers.includes(option.id)
                              ? 'font-medium'
                              : 'text-muted-foreground'
                          }
                        >
                          {option.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => removeQuestion(question.id)}
                  className='h-8 w-8'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <div className='flex justify-end'>
        <Button
          type='button'
          onClick={saveQuiz}
          disabled={
            !quizData.title.trim() || questions.length === 0 || isSaving
          }
          className='bg-gradient-to-r from-blue-500 to-purple-500 text-white'
        >
          {isSaving ? 'Saving...' : 'Save Quiz'}
        </Button>
      </div>
    </motion.div>
  )
}
