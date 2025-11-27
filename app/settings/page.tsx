import { Separator } from "@/components/ui/separator"
import ProfileSettings from "@/components/settings/profile-settings"
import AppearanceSettings from "@/components/settings/appearance-settings"
import NotificationSettings from "@/components/settings/notification-settings"
import AccountSettings from "@/components/settings/account-settings"

export default function SettingsPage() {
  return (
    <div className="container py-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <Separator />

        <div className="space-y-8 pb-8">
          <ProfileSettings />
          <Separator />
          <AppearanceSettings />
          <Separator />
          <NotificationSettings />
          <Separator />
          <AccountSettings />
        </div>
      </div>
    </div>
  )
}

