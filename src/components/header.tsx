
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

export function Header() {
  const { user, logout, mode, setMode } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const Logo = () => (
    <Link href={mode === 'host' ? '/hosting' : '/home'} className="flex items-center gap-2 text-2xl font-bold text-destructive font-headline">
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8">
        <path d="M16,1.1c-5.4,0-11,4.4-11,10.9C5,17.4,12.1,24.4,16,30.9c3.9-6.5,11-13.5,11-18.9C27,5.5,21.4,1.1,16,1.1z M16,16.8c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S19.3,16.8,16,16.8z"/>
      </svg>
      <span className="text-primary-foreground">Airbnb</span>
    </Link>
  );

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
