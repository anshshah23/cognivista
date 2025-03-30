"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Clock, TrendingUp, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Mock data for the past week
const mockData = [
  { day: "Monday", timeSpent: 120 },
  { day: "Tuesday", timeSpent: 145 },
  { day: "Wednesday", timeSpent: 132 },
  { day: "Thursday", timeSpent: 165 },
  { day: "Friday", timeSpent: 180 },
  { day: "Saturday", timeSpent: 90 },
  { day: "Sunday", timeSpent: 110 },
];

export default function AnalyticsDashboard() {
  const [averageTime, setAverageTime] = useState(0);

  // Calculate average time spent
  useEffect(() => {
    const total = mockData.reduce((acc, curr) => acc + curr.timeSpent, 0);
    setAverageTime(Math.round(total / mockData.length));
  }, []);

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">View your platform usage statistics for the past week</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Time Spent This Week
            </CardTitle>
            <CardDescription>Daily time spent on the platform over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Opposite background color */}
            <div className="h-[300px] p-4 rounded-md shadow-md"
                 style={{ backgroundColor: "hsl(var(--foreground))" }}> 
              <ChartContainer
                config={{
                  timeSpent: {
                    label: "Time Spent",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={mockData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }} 
                    style={{ backgroundColor: "hsl(var(--foreground))" }} // Opposite of theme
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--background))" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="hsl(var(--background))"
                      fontSize={12}
                      tickFormatter={(value) => `${value}m`}
                      tickLine={false}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(value) => [`${value} minutes`, "Time Spent"]} />}
                    />
                    <Line
                      type="monotone"
                      dataKey="timeSpent"
                      stroke="blue" // ✅ Graph line color changed to blue
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Time Per Day</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(averageTime)}</div>
              <p className="text-xs text-muted-foreground">Average daily platform usage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Time This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTime(mockData.reduce((acc, curr) => acc + curr.timeSpent, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Total platform usage this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
