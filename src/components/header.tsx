"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, UserCircle, LogOut, BedDouble, PlusCircle } from 'lucide-react';
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
  <Link href="/home" className="flex items-center gap-2 text-2xl font-bold text-primary-foreground font-headline">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-accent">
      <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.028a.75.75 0 00-.366.648v10.337a.75.75 0 00.33.633L9 22.01l.004.002a2.25 2.25 0 002.992 0l.004-.002 5.67-4.367a.75.75 0 00.33-.633V6.676a.75.75 0 00-.366-.648L12.378 1.602zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    </svg>
    Tripsy
  </Link>
);


export function Header() {
  const { user, logout, mode, setMode } = useAuth();
  const pathname = usePathname();

  const navItems = mode === 'guest' ? [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/my-trips', icon: Briefcase, label: 'My Trips' },
  ] : [
    { href: '/hosting', icon: BedDouble, label: 'My Listings' },
    { href: '/hosting/new', icon: PlusCircle, label: 'Add New' },
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
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent",
                  pathname === item.href ? "text-accent" : "text-primary-foreground/80"
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
            <div className="hidden items-center space-x-2 md:flex">
              <Label htmlFor="hosting-mode-switch" className="text-sm text-primary-foreground/80">Guest</Label>
              <Switch
                id="hosting-mode-switch"
                checked={mode === 'host'}
                onCheckedChange={(checked) => setMode(checked ? 'host' : 'guest')}
                aria-label="Switch between guest and hosting mode"
              />
              <Label htmlFor="hosting-mode-switch" className="text-sm text-primary-foreground/80">Host</Label>
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
