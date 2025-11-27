"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileSettings from "@/components/settings/profile-settings"
import AppearanceSettings from "@/components/settings/appearance-settings"
import NotificationSettings from "@/components/settings/notification-settings"
import AccountSettings from "@/components/settings/account-settings"
import { motion } from "framer-motion"

export default function SettingsPage() {
  return (
    <div className="container py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-background/80 backdrop-blur-sm border">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Account
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileSettings />
              </motion.div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AppearanceSettings />
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NotificationSettings />
              </motion.div>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AccountSettings />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

