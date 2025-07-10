
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Server, Cloud } from 'lucide-react';
import logo from '@/data/airbnblite_logo-trans-bg.png';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

function DeveloperSettings() {
  const { apiEndpoint, setApiEndpoint } = useAuth();
  const [isChecked, setIsChecked] = useState(apiEndpoint === 'cloud');

  const handleToggle = (checked: boolean) => {
    const newEndpoint = checked ? 'cloud' : 'local';
    setApiEndpoint(newEndpoint);
    setIsChecked(checked);
  };

  if (!setApiEndpoint) return null;

  return (
    <>
      <Separator className="my-6" />
      <div className="space-y-3 px-6 pb-4">
        <Label className="text-xs font-semibold text-muted-foreground">Developer Settings</Label>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="flex items-center gap-2">
            {isChecked ? <Cloud className="h-5 w-5 text-primary" /> : <Server className="h-5 w-5 text-primary" />}
            <Label htmlFor="api-switch" className="text-sm">
              API: <span className="font-bold">{isChecked ? 'Cloud' : 'Local'}</span>
            </Label>
          </div>
          <Switch
            id="api-switch"
            checked={isChecked}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
    </>
  );
}


export default function LoginPage() {
  const [email, setEmail] = useState('alex@gmail.com');
  const [password, setPassword] = useState('password123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/home');
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const success = await login(email, password);
    if (success) {
      router.push('/home');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    }
    setIsLoggingIn(false);
  };

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
                placeholder="alex@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggingIn}
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
                disabled={isLoggingIn}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn && <Loader2 className="animate-spin mr-2" />}
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
        <DeveloperSettings />
      </Card>
    </div>
  );
}
