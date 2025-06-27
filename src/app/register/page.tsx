
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { User } from '@/lib/types';

const registerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
  avatar: z.string().url('Please enter a valid URL for your avatar.').optional().or(z.literal('')),
  isHost: z.boolean().default(false).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: '',
      isHost: false,
    },
  });

  function onSubmit(data: RegisterFormValues) {
    const newUserData: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: data.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${data.name}`,
        isHost: data.isHost || false,
    };

    const result = register(newUserData);

    if (result.success) {
      toast({
        title: 'Registration Successful!',
        description: 'You can now log in with your new account.',
      });
      router.push('/login');
    } else {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: result.message,
      });
    }
  }

  const Logo = () => (
    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-destructive font-headline mb-2">
      <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-10 h-10">
        <path d="M424.3 27.2C368.7-2.5 292.2-8.1 221.1 12.2 99.4 48.5 14.8 158.4 15.1 282.8c.4 135.5 110.2 245.4 245.7 245.7 34.5.1 68.3-6.6 99.4-19.5 32.7-13.6 62.4-33.7 87.2-59.2 4.3-4.4 8.2-8.9 11.7-13.6 57.3-75.5 61.5-179.3 11-259.4C447.9 143.7 441 113.6 441 82.5c0-18.5 6.1-36.5 17.5-51.1 1.7-2.1 3.5-4.2 5.3-6.2zm-49.8 284.4c-25.3 50.8-80.6 84.4-138.2 84.4-83.3 0-150.8-67.6-150.8-150.8s67.6-150.8 150.8-150.8c57.6 0 112.9 33.5 138.2 84.4 14.3 28.6 18.2 60.1 11.4 90.4-6.9 30.3-25.2 57.3-51.4 72z"/>
      </svg>
      <span>Airbnb</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join our community of travelers and hosts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name<span className="text-destructive ml-1">*</span></FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email<span className="text-destructive ml-1">*</span></FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password<span className="text-destructive ml-1">*</span></FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password<span className="text-destructive ml-1">*</span></FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="avatar" render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl><Input placeholder="https://your-image-url.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isHost" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Sign up as a host</FormLabel>
                      <FormDescription>Check this box if you want to be able to list properties.</FormDescription>
                    </div>
                  </FormItem>
              )} />
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
          <p className="text-muted-foreground">Already have an account?&nbsp;</p>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
