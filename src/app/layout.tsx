import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { BookingsProvider } from '@/hooks/use-bookings';
import './globals.css';
import beloLogo from '@/data/airbnb-belo-logo.png';

export const metadata: Metadata = {
  title: 'Airbnb',
  description: 'A modern Airbnb clone',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={beloLogo.src} type="image/png" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          <BookingsProvider>
            {children}
            <Toaster />
          </BookingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
