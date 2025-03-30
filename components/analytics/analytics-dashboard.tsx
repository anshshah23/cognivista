"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Calendar, Clock, Video, Image, BookOpen, MessageSquare, PenTool, TrendingUp, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState("week")
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/summary?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  // Format data for charts
  const getServiceData = () => {
    if (!summary) return []

    return Object.entries(summary.serviceBreakdown).map(([service, data]: [string, any]) => ({
      name: formatServiceName(service),
      value: Number.parseFloat(data.hours),
      seconds: data.seconds,
    }))
  }

  const getDailyData = () => {
    if (!summary) return []

    return Object.entries(summary.dailyUsage).map(([date, seconds]: [string, any]) => ({
      date: formatDate(date),
      hours: ((seconds as number) / 3600).toFixed(1),
    }))
  }

  const formatServiceName = (service: string) => {
    switch (service) {
      case "whiteboard":
        return "Whiteboard"
      case "video":
        return "Video Learning"
      case "image-learning":
        return "Image Learning"
      case "quizzes":
        return "Quizzes"
      case "collaboration":
        return "Collaboration"
      default:
        return service
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const COLORS = ["#4F46E5", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-background/80 backdrop-blur-sm border">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Services
            </TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              Time Analysis
            </TabsTrigger>
          </TabsList>

          <div className="flex justify-end my-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px] bg-background/80 backdrop-blur-sm border">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="card-hover bg-background/80 backdrop-blur-sm border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                    <Clock className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "Loading..." : `${summary?.totalDurationHours || 0} hours`}
                    </div>
                    <p className="text-xs text-muted-foreground">Total time spent on the platform</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="card-hover bg-background/80 backdrop-blur-sm border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                    <Calendar className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "Loading..." : `${summary?.averageDailyUsageHours || 0} hours`}
                    </div>
                    <p className="text-xs text-muted-foreground">Average daily usage</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="card-hover bg-background/80 backdrop-blur-sm border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Used</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "Loading..." : formatServiceName(summary?.mostUsedService || "")}
                    </div>
                    <p className="text-xs text-muted-foreground">Your most used service</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="card-hover bg-background/80 backdrop-blur-sm border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                    <Activity className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? "Loading..." : summary?.totalSessions || 0}</div>
                    <p className="text-xs text-muted-foreground">Total number of sessions</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card className="col-span-1 card-hover bg-background/80 backdrop-blur-sm border">
                  <CardHeader>
                    <CardTitle>Service Usage</CardTitle>
                    <CardDescription>Time spent on each service</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getServiceData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}h`}
                          >
                            {getServiceData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} hours`, "Time Spent"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="col-span-1 card-hover bg-background/80 backdrop-blur-sm border">
                  <CardHeader>
                    <CardTitle>Daily Usage</CardTitle>
                    <CardDescription>Hours spent per day</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getDailyData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="date" />
                          <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                          <Tooltip formatter={(value) => [`${value} hours`, "Time Spent"]} />
                          <Bar dataKey="hours" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Whiteboard</CardTitle>
                  <PenTool className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "Loading..." : `${summary?.serviceBreakdown?.whiteboard?.hours || 0} hours`}
                  </div>
                  <p className="text-xs text-muted-foreground">Time spent using whiteboards</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Video Learning</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "Loading..." : `${summary?.serviceBreakdown?.video?.hours || 0} hours`}
                  </div>
                  <p className="text-xs text-muted-foreground">Time spent watching videos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Image Learning</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "Loading..." : `${summary?.serviceBreakdown?.["image-learning"]?.hours || 0} hours`}
                  </div>
                  <p className="text-xs text-muted-foreground">Time spent on image learning</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "Loading..." : `${summary?.serviceBreakdown?.quizzes?.hours || 0} hours`}
                  </div>
                  <p className="text-xs text-muted-foreground">Time spent on quizzes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collaboration</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "Loading..." : `${summary?.serviceBreakdown?.collaboration?.hours || 0} hours`}
                  </div>
                  <p className="text-xs text-muted-foreground">Time spent collaborating</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Service Comparison</CardTitle>
                <CardDescription>Compare time spent across different services</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getServiceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value) => [`${value} hours`, "Time Spent"]} />
                      <Bar dataKey="value" fill="#8884d8">
                        {getServiceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Trends</CardTitle>
                <CardDescription>Your usage patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDailyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value) => [`${value} hours`, "Time Spent"]} />
                      <Bar dataKey="hours" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Tips</CardTitle>
                  <CardDescription>Based on your usage patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary"></div>
                      <span>Try to maintain consistent daily study sessions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary"></div>
                      <span>Balance your time across different learning methods</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary"></div>
                      <span>Consider spending more time on interactive quizzes</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-primary"></div>
                      <span>Collaborative learning shows better retention rates</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Focus</CardTitle>
                  <CardDescription>Areas to improve based on your usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      <p>Analyzing your data...</p>
                    ) : (
                      <>
                        <div>
                          <h4 className="font-medium mb-1">Least Used Service</h4>
                          <p className="text-sm text-muted-foreground">You could benefit from spending more time on:</p>
                          <p className="font-medium mt-1">
                            {Object.entries(summary?.serviceBreakdown || {})
                              .sort((a, b) => (a[1].seconds as number) - (b[1].seconds as number))
                              .map(([service]) => formatServiceName(service))[0] || "N/A"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-1">Consistency</h4>
                          <p className="text-sm text-muted-foreground">
                            Try to maintain a more consistent schedule across the week
                          </p>
                          <Button className="mt-2" variant="outline">
                            View Schedule Planner
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

