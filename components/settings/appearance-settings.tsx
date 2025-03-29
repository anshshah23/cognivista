"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Laptop } from "lucide-react"

export default function AppearanceSettings() {
  const { setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<string>("system") // The actual saved theme
  const [currentTheme, setCurrentTheme] = useState<string>("system") // Live preview theme
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Fetch user's saved theme from profile
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        const data = await res.json()
        if (data.profile?.theme) {
          setSelectedTheme(data.profile.theme)
          setCurrentTheme(data.profile.theme) // Keep both in sync initially
          setTheme(data.profile.theme) // Apply the saved theme
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [])

  const handleThemeChange = (value: string) => {
    setCurrentTheme(value) // Update preview theme
    setTheme(value) // Apply theme instantly
  }

  const handleSavePreferences = async () => {
    if (currentTheme === selectedTheme) return // Prevent unnecessary API calls

    setIsSaving(true)

    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: currentTheme }),
      })
      setSelectedTheme(currentTheme) // Confirm the new saved theme
    } catch (error) {
      console.error("Error saving theme:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setCurrentTheme(selectedTheme) // Revert preview to last saved theme
    setTheme(selectedTheme) // Apply the saved theme again
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how the application looks on your device.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label>Theme</Label>
              <RadioGroup
                value={currentTheme}
                onValueChange={handleThemeChange}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
              >
                <div>
                  <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Light
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Dark
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary"
                  >
                    <Laptop className="mb-3 h-6 w-6" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSavePreferences}
                disabled={isSaving || currentTheme === selectedTheme}
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={currentTheme === selectedTheme}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
