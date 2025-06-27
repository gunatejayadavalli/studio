
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('password123');
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      router.push('/home');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    }
  };

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
      <Card className="w-full max-w-sm mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
          <p className="text-muted-foreground">Don't have an account?&nbsp;</p>
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
