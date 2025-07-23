'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { User, Mail, Lock, Bell, Globe, Moon, Sun, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form schemas
const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(160).optional(),
  website: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
});

const emailFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type EmailFormValues = z.infer<typeof emailFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function AccountSettings() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEmailVerified, setIsEmailVerified] = useState(true); // In a real app, check from session
  
  // Initialize profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || '',
      bio: (session?.user as any)?.bio || '', // Type assertion for bio field
      website: '',
    },
  });

  // Initialize email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: session?.user?.email || '',
      currentPassword: '',
    },
  });

  // Initialize password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      // In a real app, you would call your API to update the profile
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...data,
        },
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email update
  const onEmailSubmit = async (data: EmailFormValues) => {
    try {
      setIsLoading(true);
      // In a real app, you would call your API to update the email
      // const response = await fetch('/api/user/email', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // Update the session with new email
      await update({
        ...session,
        user: {
          ...session?.user,
          email: data.email,
        },
      });
      
      toast.success('Email updated successfully');
      emailForm.reset({ email: data.email, currentPassword: '' });
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password update
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setIsLoading(true);
      // In a real app, you would call your API to update the password
      // const response = await fetch('/api/user/password', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      toast.success('Password updated successfully');
      passwordForm.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        // In a real app, you would call your API to delete the account
        // const response = await fetch('/api/user', { method: 'DELETE' });
        
        // Sign out after account deletion
        await signOut({ redirect: false });
        router.push('/');
        toast.success('Your account has been deleted');
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your profile information and avatar
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="text-2xl">
                      {session?.user?.name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                </div>

                <Form {...profileForm}>
                  <form 
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="flex-1 space-y-4"
                  >
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input 
                                placeholder="Your name" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a little bit about yourself"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A brief description of yourself (max 160 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input 
                                placeholder="https://example.com" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your email address
              </p>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form 
                  onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              placeholder="your@email.com" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              type="password"
                              placeholder="••••••••" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <div className="text-sm text-muted-foreground">
                      {isEmailVerified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Email verified
                        </span>
                      ) : (
                        <span className="text-amber-600">Email not verified</span>
                      )}
                    </div>
                    {!isEmailVerified && (
                      <Button type="button" variant="link" size="sm" className="h-auto p-0">
                        Resend verification email
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Email'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your password
              </p>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form 
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              type="password"
                              placeholder="••••••••" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              type="password"
                              placeholder="••••••••" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              type="password"
                              placeholder="••••••••" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize the appearance of the app
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred theme
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </Button>
                    <Button variant="outline" size="sm">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </Button>
                    <Button variant="outline" size="sm">
                      <span className="mr-2">🌓</span>
                      System
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="font-size">Font Size</Label>
                      <p className="text-sm text-muted-foreground">
                        Adjust the font size for better readability
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Aa
                      </Button>
                      <Button variant="outline" size="sm">
                        Aa
                      </Button>
                      <Button variant="outline" size="sm">
                        Aa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your email notification preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-comments">Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when someone comments on your posts
                    </p>
                  </div>
                  <Switch id="email-comments" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-mentions">Mentions</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when someone mentions you
                    </p>
                  </div>
                  <Switch id="email-mentions" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-follows">New Followers</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when someone follows you
                    </p>
                  </div>
                  <Switch id="email-follows" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-newsletter">Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive our monthly newsletter with updates
                    </p>
                  </div>
                  <Switch id="email-newsletter" defaultChecked />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your push notification preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-comments">Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications for new comments
                    </p>
                  </div>
                  <Switch id="push-comments" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-mentions">Mentions</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications when mentioned
                    </p>
                  </div>
                  <Switch id="push-mentions" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-updates">Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates and announcements
                    </p>
                  </div>
                  <Switch id="push-updates" defaultChecked />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
