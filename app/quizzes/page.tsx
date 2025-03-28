import { Separator } from "@/components/ui/separator"
import QuizList from "@/components/quizzes/quiz-list"
import QuizCreator from "@/components/quizzes/quiz-creator"

export default function QuizzesPage() {
  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes & Assessments</h1>
          <p className="text-muted-foreground">Create, take, and review educational quizzes.</p>
        </div>
        <Separator />

        <QuizCreator />
        <Separator />
        <QuizList />
      </div>
    </div>
  )
}

