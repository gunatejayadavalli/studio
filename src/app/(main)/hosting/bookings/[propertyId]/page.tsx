
"use client";

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { properties } from '@/lib/data';
import { useBookings } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, BedDouble } from 'lucide-react';
import { format } from 'date-fns';

export default function PropertyBookingsPage() {
  const params = useParams();
  const propertyId = params.propertyId as string;
  const { bookings } = useBookings();
  const { allUsers: users } = useAuth();

  const property = properties.find((p) => p.id === propertyId);
  const propertyBookings = bookings.filter((b) => b.propertyId === propertyId);

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 md:px-6">
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
            <Link href="/hosting"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings</Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline">Bookings for {property.title}</h1>
        <p className="text-muted-foreground">You have {propertyBookings.length} booking(s) for this property.</p>
      </div>

      {propertyBookings.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <BedDouble className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>No Bookings Yet</CardTitle>
            <CardDescription>This property has not been booked yet.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-6">
          {propertyBookings.map((booking) => {
            const guest = users.find((u) => u.id === booking.userId);
            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={guest?.avatar} alt={guest?.name} />
                      <AvatarFallback>{guest?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{guest?.name}</CardTitle>
                      <CardDescription>Guest</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${booking.totalCost.toFixed(2)}</p>
                     <p className="text-sm text-muted-foreground">Total Paid</p>
                  </div>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-semibold">Check-in</p>
                            <p>{format(new Date(booking.checkIn), 'eeee, MMM d, yyyy')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-semibold">Check-out</p>
                            <p>{format(new Date(booking.checkOut), 'eeee, MMM d, yyyy')}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-semibold">Guests</p>
                            <p>{booking.guests}</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
