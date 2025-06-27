// src/app/(main)/my-trips/[bookingId]/page.tsx
"use client";

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { bookings, properties, users, faqs } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Shield, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import { Chatbot } from '@/components/chatbot';

export default function TripDetailsPage({ params }: { params: { bookingId: string } }) {
  const booking = bookings.find((b) => b.id === params.bookingId);

  if (!booking) {
    notFound();
  }

  const property = properties.find((p) => p.id === booking.propertyId);
  const host = users.find(u => u.id === property?.hostId);
  const propertyFaqs = faqs.filter(f => f.propertyId === property?.id);

  if (!property || !host) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg mb-6">
            <Image
              src={property.thumbnail}
              alt={property.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <h1 className="text-4xl font-bold font-headline mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>{property.location}</span>
          </div>
          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary"/>
                        <span>Trip Dates</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{format(new Date(booking.checkIn), 'eeee, MMM d, yyyy')}</p>
                    <p className="text-muted-foreground">to</p>
                    <p>{format(new Date(booking.checkOut), 'eeee, MMM d, yyyy')}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary"/>
                        <span>Guests</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{booking.guests}</p>
                </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          <div>
             <h2 className="text-2xl font-bold font-headline mb-4">Host Information</h2>
             <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={host.avatar} alt={host.name} />
                  <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{host.name}</p>
                    <p className="text-muted-foreground">Your host for this trip.</p>
                </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96">
            <Card>
                <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-semibold">${booking.totalCost.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Travel Insurance</span>
                        {booking.hasInsurance ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                                <Shield className="w-4 h-4 mr-1"/>
                                Protected
                            </Badge>
                        ) : (
                             <Badge variant="destructive">
                                <ShieldOff className="w-4 h-4 mr-1"/>
                                Not Protected
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
       <Chatbot booking={booking} property={property} faqs={propertyFaqs} />
    </div>
  );
}
