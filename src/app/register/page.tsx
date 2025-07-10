
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { User } from '@/lib/types';
import { Loader2, Server, Cloud, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '@/data/airbnblite_logo-trans-bg.png';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

function DeveloperSettings() {
  const { apiEndpoint, checkAndSetApiEndpoint, apiStatus, isCheckingApi } = useAuth();
  const [isChecked, setIsChecked] = useState(apiEndpoint === 'cloud');

  const handleToggle = async (checked: boolean) => {
    const newEndpoint = checked ? 'cloud' : 'local';
    setIsChecked(checked);
    await checkAndSetApiEndpoint(newEndpoint);
  };
  
  useEffect(() => {
    setIsChecked(apiEndpoint === 'cloud');
  }, [apiEndpoint]);

  const apiName = isChecked ? 'Cloud' : 'Local';

  return (
    <>
      <Separator className="my-6" />
      <div className="space-y-3 px-6 pb-4">
        <Label className="text-xs font-semibold text-muted-foreground">Developer Settings</Label>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="flex items-center gap-2">
            {isChecked ? <Cloud className="h-5 w-5 text-primary" /> : <Server className="h-5 w-5 text-primary" />}
            <Label htmlFor="api-switch-register" className="text-sm cursor-pointer">
              API: <span className="font-bold">{apiName}</span>
            </Label>
          </div>
          <Switch
            id="api-switch-register"
            checked={isChecked}
            onCheckedChange={handleToggle}
            disabled={isCheckingApi}
          />
        </div>
        <div className="flex items-center justify-start text-xs text-muted-foreground pt-1 min-h-[20px]">
            {isCheckingApi && (
                <div className="flex items-center gap-1.5 text-blue-600">
                    <RefreshCw className="h-3 w-3 animate-spin"/>
                    <span>Checking status...</span>
                </div>
            )}
            {!isCheckingApi && apiStatus === 'online' && (
                <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle className="h-3 w-3"/>
                    <span>{apiName} API is ready</span>
                </div>
            )}
            {!isCheckingApi && apiStatus === 'offline' && (
                <div className="flex items-center gap-1.5 text-red-600">
                    <XCircle className="h-3 w-3"/>
                    <span>{apiName} API is not ready</span>
                </div>
            )}
        </div>
      </div>
    </>
  );
}


export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading, apiStatus } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/home');
    }
  }, [user, isLoading, router]);

  async function onSubmit(data: RegisterFormValues) {
    setIsSubmitting(true);
    const newUserData: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: data.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${data.name}`,
        isHost: data.isHost || false,
    };

    const result = await register(newUserData);

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
    setIsSubmitting(false);
  }

  const Logo = () => (
    <div className="flex justify-center mb-2">
      <Image
        src={logo}
        alt="Airbnb logo"
        width={120}
        height={38}
        className="h-12 w-auto"
        priority
      />
    </div>
  );

  if (isLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const isApiOffline = apiStatus === 'offline';

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
                <FormItem><FormLabel>Full Name<span className="text-destructive ml-1">*</span></FormLabel><FormControl><Input placeholder="John Doe" {...field} disabled={isSubmitting || isApiOffline} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email<span className="text-destructive ml-1">*</span></FormLabel><FormControl><Input type="email" placeholder="you@gmail.com" {...field} disabled={isSubmitting || isApiOffline} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password<span className="text-destructive ml-1">*</span></FormLabel><FormControl><Input type="password" {...field} disabled={isSubmitting || isApiOffline} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm Password<span className="text-destructive ml-1">*</span></FormLabel><FormControl><Input type="password" {...field} disabled={isSubmitting || isApiOffline} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="avatar" render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl><Input placeholder="https://your-image-url.com" {...field} disabled={isSubmitting || isApiOffline} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isHost" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting || isApiOffline} /></FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Sign up as a host</FormLabel>
                      <FormDescription>Check this box if you want to be able to list properties.</FormDescription>
                    </div>
                  </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={isSubmitting || isApiOffline}>
                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
          <p className="text-muted-foreground">Already have an account?&nbsp;</p>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log In
          </Link>
        </CardFooter>
        <DeveloperSettings />
      </Card>
    </div>
  );
}
