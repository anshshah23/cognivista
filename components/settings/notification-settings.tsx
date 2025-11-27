"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Mail } from "lucide-react"

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      newMessages: true,
      newComments: false,
      reminders: true,
      updates: true,
    },
    push: {
      newMessages: true,
      newComments: true,
      reminders: false,
      updates: false,
    },
  })

  const handleToggle = (category: "email" | "push", setting: string) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof (typeof prev)[category]],
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save notification settings to backend
    console.log("Notification settings updated:", notifications)
    // Show success message
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">Configure how you want to be notified about activities.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium flex items-center mb-4">
                <Mail className="mr-2 h-5 w-5" />
                Email Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-messages">New Messages</Label>
                    <p className="text-xs text-muted-foreground">Email when someone sends you a message</p>
                  </div>
                  <Switch
                    id="email-messages"
                    checked={notifications.email.newMessages}
                    onCheckedChange={() => handleToggle("email", "newMessages")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-comments">New Comments</Label>
                    <p className="text-xs text-muted-foreground">Email when someone comments on your content</p>
                  </div>
                  <Switch
                    id="email-comments"
                    checked={notifications.email.newComments}
                    onCheckedChange={() => handleToggle("email", "newComments")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-reminders">Reminders</Label>
                    <p className="text-xs text-muted-foreground">Email about upcoming events and deadlines</p>
                  </div>
                  <Switch
                    id="email-reminders"
                    checked={notifications.email.reminders}
                    onCheckedChange={() => handleToggle("email", "reminders")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-updates">Platform Updates</Label>
                    <p className="text-xs text-muted-foreground">Email about new features and updates</p>
                  </div>
                  <Switch
                    id="email-updates"
                    checked={notifications.email.updates}
                    onCheckedChange={() => handleToggle("email", "updates")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium flex items-center mb-4">
                <Bell className="mr-2 h-5 w-5" />
                Push Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-messages">New Messages</Label>
                    <p className="text-xs text-muted-foreground">Push notification when someone sends you a message</p>
                  </div>
                  <Switch
                    id="push-messages"
                    checked={notifications.push.newMessages}
                    onCheckedChange={() => handleToggle("push", "newMessages")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-comments">New Comments</Label>
                    <p className="text-xs text-muted-foreground">Push notification when someone comments on your content</p>
                  </div>
                  <Switch
                    id="push-comments"
                    checked={notifications.push.newComments}
                    onCheckedChange={() => handleToggle("push", "newComments")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-reminders">Reminders</Label>
                    <p className="text-xs text-muted-foreground">Push notification about upcoming events and deadlines</p>
                  </div>
                  <Switch
                    id="push-reminders"
                    checked={notifications.push.reminders}
                    onCheckedChange={() => handleToggle("push", "reminders")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-updates">Platform Updates</Label>
                    <p className="text-xs text-muted-foreground">Push notification about new features and updates</p>
                  </div>
                  <Switch
                    id="push-updates"
                    checked={notifications.push.updates}
                    onCheckedChange={() => handleToggle("push", "updates")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  )
}

