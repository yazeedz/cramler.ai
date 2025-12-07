"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useUserContextValue } from "@/app/providers/UserContextProvider"
import { createClient } from "@/app/utils/supabase/client"
import {
  User,
  Building2,
  Users,
  Settings2,
  Mail,
  Calendar,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react"

export default function SettingsPage() {
  const { user, currentOrganization, currentBrand, organizations, isLoading } = useUserContextValue()
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  if (isLoading) {
    return <SettingsSkeleton />
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
          <p className="text-muted-foreground">Please log in to view settings.</p>
        </div>
      </div>
    )
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userInitials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold font-manrope">Settings</h1>
        <p className="text-muted-foreground">Manage your account, brand, and team settings</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Brand
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{displayName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <Separator />

              {/* Account Details */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input value={user.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email is managed through your authentication provider
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Account Created
                  </Label>
                  <Input value={new Date(user.created_at).toLocaleDateString()} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Organizations you belong to</CardDescription>
            </CardHeader>
            <CardContent>
              {organizations.length === 0 ? (
                <div className="text-center py-6">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You're not part of any organization</p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {org.logo_url ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={org.logo_url} alt={org.name} />
                            <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-muted-foreground">/{org.slug}</p>
                        </div>
                      </div>
                      {currentOrganization?.id === org.id && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Tab */}
        <TabsContent value="brand" className="space-y-6">
          {!currentBrand ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Brand Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a brand from the sidebar to manage its settings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Brand Information</CardTitle>
                  <CardDescription>Manage your brand details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Brand Logo */}
                  <div className="flex items-center gap-4">
                    {currentBrand.logo_url ? (
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={currentBrand.logo_url} alt={currentBrand.name} />
                        <AvatarFallback className="text-2xl">
                          {currentBrand.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Button variant="outline" size="sm">Change Logo</Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Brand Details Form */}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="brandName">Brand Name</Label>
                      <Input id="brandName" defaultValue={currentBrand.name} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="brandSlug">Brand URL Slug</Label>
                      <Input id="brandSlug" defaultValue={currentBrand.slug} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="brandDescription">Description</Label>
                      <Textarea
                        id="brandDescription"
                        defaultValue={currentBrand.description || ''}
                        placeholder="A brief description of your brand..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions for this brand</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-900">Delete Brand</h4>
                      <p className="text-sm text-red-700">
                        Permanently delete this brand and all its data
                      </p>
                    </div>
                    <Button variant="destructive">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          {!currentOrganization ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Organization</h3>
                <p className="text-muted-foreground mb-4">
                  Create or join an organization to manage team members.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage who has access to {currentOrganization.name}
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Current User */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Owner</Badge>
                      <Badge variant="secondary">You</Badge>
                    </div>
                  </div>

                  {/* Placeholder for other members */}
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No other team members yet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  )
}
