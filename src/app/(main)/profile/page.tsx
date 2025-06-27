
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useBookings } from '@/hooks/use-bookings';
import { properties } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  avatar: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  isHost: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, changePassword, isLoading } = useAuth();
  const { bookings } = useBookings();
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', avatar: '', isHost: false },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        avatar: user.avatar,
        isHost: user.isHost,
      });
    }
  }, [user, profileForm]);

  const hostProperties = user?.isHost ? properties.filter(p => p.hostId === user.id) : [];
  const hasActiveBookings = bookings.some(b => hostProperties.some(p => p.id === b.propertyId));

  if (isLoading || !user) {
    return (
      <div className="container mx-auto max-w-xl py-8 px-4 md:px-6">
        <Card>
          <CardHeader><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-full max-w-xs" /></CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-grow space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            </div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  function onProfileSubmit(data: ProfileFormValues) {
    updateUser(data);
    toast({ title: 'Profile Updated', description: 'Your profile information has been saved.' });
  }

  function onPasswordSubmit(data: PasswordFormValues) {
    const result = changePassword(data.currentPassword, data.newPassword);
    if (result.success) {
      toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
      passwordForm.reset();
    } else {
      toast({ variant: "destructive", title: 'Password Change Failed', description: result.message });
    }
  }

  return (
    <div className="container mx-auto max-w-xl py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Edit Profile</CardTitle>
          <CardDescription>Update your personal information and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20"><AvatarImage src={profileForm.watch('avatar') || user?.avatar} alt={user?.name} /><AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-grow">
                   <FormField control={profileForm.control} name="avatar" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl><Input placeholder="https://example.com/avatar.png" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
              </div>
               <FormField control={profileForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name<span className="text-destructive ml-1">*</span></FormLabel>
                    <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

              <FormField
                control={profileForm.control}
                name="isHost"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Hosting</FormLabel>
                      <FormDescription>
                        Turn on to list and manage your properties.
                        {user.isHost && hasActiveBookings && (
                          <span className="text-xs text-destructive/90 block mt-1">
                            Cannot be disabled while you have active bookings.
                          </span>
                        )}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={user.isHost && hasActiveBookings}
                        aria-readonly={user.isHost && hasActiveBookings}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Save Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password<span className="text-destructive ml-1">*</span></FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password<span className="text-destructive ml-1">*</span></FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password<span className="text-destructive ml-1">*</span></FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit">Update Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
