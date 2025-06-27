"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Briefcase, UserCircle, LogOut, BedDouble } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Logo = () => (
  <Link href="/home" className="flex items-center gap-2 text-2xl font-bold text-destructive font-headline">
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8">
      <path d="M16 1.11A10.43 10.43 0 0 0 5.57 11.54c0 7.8 8.94 15.35 9.6 16.14a1 1 0 0 0 1.66 0c.66-.79 9.6-8.34 9.6-16.14A10.43 10.43 0 0 0 16 1.11zM16 15.84a4.31 4.31 0 1 1 0-8.62 4.31 4.31 0 0 1 0 8.62z"/>
    </svg>
    <span className="text-primary-foreground">Airbnb</span>
  </Link>
);


export function Header() {
  const { user, logout, mode, setMode } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = mode === 'guest' ? [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/my-trips', icon: Briefcase, label: 'My Trips' },
  ] : [
    { href: '/hosting', icon: BedDouble, label: 'My Listings' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary-foreground",
                  pathname === item.href ? "text-primary-foreground font-semibold" : "text-primary-foreground/80"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user?.isHost && (
            <div className="hidden items-center space-x-2 md:flex bg-primary-foreground/10 p-1 rounded-full">
              <Label htmlFor="hosting-mode-switch" className="text-sm text-primary-foreground/90 px-2 cursor-pointer">Guest</Label>
              <Switch
                id="hosting-mode-switch"
                checked={mode === 'host'}
                onCheckedChange={(checked) => setMode(checked ? 'host' : 'guest')}
                aria-label="Switch between guest and hosting mode"
              />
              <Label htmlFor="hosting-mode-switch" className="text-sm text-primary-foreground/90 px-2 cursor-pointer">Host</Label>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-accent">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
