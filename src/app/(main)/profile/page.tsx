"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  avatar: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      avatar: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        avatar: user.avatar,
      });
    }
  }, [user, form]);
  
  if (isLoading || !user) {
    return (
      <div className="container mx-auto max-w-xl py-8 px-4 md:px-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  function onSubmit(data: ProfileFormValues) {
    updateUser(data);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
    router.push('/home');
  }

  return (
    <div className="container mx-auto max-w-xl py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Edit Profile</CardTitle>
          <CardDescription>Update your name and profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={form.watch('avatar') || user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                   <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
