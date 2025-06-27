// src/app/(main)/my-trips/page.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useBookings } from '@/hooks/use-bookings';
import { properties } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, MapPin, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function MyTripsPage() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const userBookings = bookings.filter((b) => b.userId === user?.id).sort((a,b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  if (userBookings.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">My Trips</h1>
        <p className="text-muted-foreground mb-6">You have no upcoming or past trips.</p>
        <Button asChild>
          <Link href="/home">Start Exploring</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold font-headline mb-8">My Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userBookings.map((booking) => {
          const property = properties.find((p) => p.id === booking.propertyId);
          if (!property) return null;

          const isCancelled = booking.status !== 'confirmed';
          const cancellationMessage = booking.status === 'cancelled-by-host' ? 'Cancelled by Host' : 'Cancelled by You';

          return (
            <Card key={booking.id} className={cn("flex flex-col", isCancelled && "bg-muted/50")}>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={property.thumbnail}
                    alt={property.title}
                    layout="fill"
                    objectFit="cover"
                    className={cn("rounded-t-lg", isCancelled && "grayscale")}/>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                 {isCancelled && (
                   <Badge variant="destructive" className="mb-2 gap-1.5">
                    <Ban className="w-3.5 h-3.5"/> {cancellationMessage}
                   </Badge>
                 )}
                <CardTitle className="text-lg font-headline mb-2">{property.title}</CardTitle>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(booking.checkIn), 'MMM d, yyyy')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button asChild className="w-full">
                  <Link href={`/my-trips/${booking.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
