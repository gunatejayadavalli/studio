
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
      <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-8 h-8">
        <path d="M424.3 27.2C368.7-2.5 292.2-8.1 221.1 12.2 99.4 48.5 14.8 158.4 15.1 282.8c.4 135.5 110.2 245.4 245.7 245.7 34.5.1 68.3-6.6 99.4-19.5 32.7-13.6 62.4-33.7 87.2-59.2 4.3-4.4 8.2-8.9 11.7-13.6 57.3-75.5 61.5-179.3 11-259.4C447.9 143.7 441 113.6 441 82.5c0-18.5 6.1-36.5 17.5-51.1 1.7-2.1 3.5-4.2 5.3-6.2zm-49.8 284.4c-25.3 50.8-80.6 84.4-138.2 84.4-83.3 0-150.8-67.6-150.8-150.8s67.6-150.8 150.8-150.8c57.6 0 112.9 33.5 138.2 84.4 14.3 28.6 18.2 60.1 11.4 90.4-6.9 30.3-25.2 57.3-51.4 72z"/>
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
