"use client";

import Link from 'next/link';
import Image from 'next/image';
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
import logo from '@/data/airbnblite_logo-trans-bg.png';

export function Header() {
  const { user, logout, mode, setMode } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const Logo = () => (
    <Link href={mode === 'host' ? '/hosting' : '/home'} className="flex items-center text-2xl font-bold text-primary-foreground font-headline">
      <Image
        src={logo}
        alt="Airbnb logo"
        width={102}
        height={32}
        className="h-8 w-auto"
      />
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

              {/* Mobile Nav & Toggle */}
              <div className="md:hidden">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
                {user?.isHost && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default">
                      <div className="flex w-full items-center justify-between">
                        <Label htmlFor="hosting-mode-switch-mobile" className="cursor-pointer font-medium">Guest</Label>
                        <Switch
                          id="hosting-mode-switch-mobile"
                          checked={mode === 'host'}
                          onCheckedChange={(checked) => setMode(checked ? 'host' : 'guest')}
                          aria-label="Switch between guest and hosting mode"
                        />
                        <Label htmlFor="hosting-mode-switch-mobile" className="cursor-pointer font-medium">Host</Label>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
              </div>

              {/* Common Items */}
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>My Profile</span>
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
