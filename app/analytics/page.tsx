import { Separator } from "@/components/ui/separator"
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your productivity and usage across the platform.</p>
        </div>
        <Separator />

        <AnalyticsDashboard />
      </div>
    </div>
  )
}

