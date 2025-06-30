// src/app/(main)/my-trips/[bookingId]/page.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useBookings } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { properties, insurancePlans } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, ShieldCheck, ShieldAlert, CheckCircle, FileText, Ban, Info, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Chatbot } from '@/components/chatbot';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

export default function TripDetailsPage() {
  const params = useParams();
  const { bookings, cancelBooking } = useBookings();
  const { allUsers: users } = useAuth();
  const { toast } = useToast();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const booking = bookings.find((b) => b.id === params.bookingId);

  if (!booking) {
    notFound();
  }

  const property = properties.find((p) => p.id === booking.propertyId);
  const host = users.find(u => u.id === property?.hostId);
  const insurancePlan = booking.insurancePlanId 
    ? insurancePlans.find(p => p.id === booking.insurancePlanId) 
    : undefined;
    
  const isCancelled = booking.status !== 'confirmed';

  if (!property || !host) {
    notFound();
  }

  const handleCancellation = () => {
    cancelBooking(booking.id, 'guest');
    toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled and a refund has been issued.",
    })
    setIsCancelDialogOpen(false);
  }

  return (
    <>
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
             {isCancelled && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center text-white p-4 bg-black/50 rounded-lg">
                    <Ban className="w-16 h-16 mx-auto mb-2 text-destructive" />
                    <h2 className="text-2xl font-bold">Booking Cancelled</h2>
                    <p className="text-sm">
                      {booking.status === 'cancelled-by-guest'
                        ? 'This booking was cancelled by you.'
                        : 'This booking was cancelled by the host.'}
                    </p>
                  </div>
              </div>
             )}
          </div>
          <h1 className="text-4xl font-bold font-headline mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-5 h-5" />
            <span>{property.location}</span>
          </div>
          <Separator className="my-6" />

           {isCancelled && (
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
              <CardHeader className="flex-row gap-4 items-center">
                 <AlertTriangle className="w-8 h-8 text-yellow-600"/>
                 <div>
                    <CardTitle className="text-xl">Cancellation Details</CardTitle>
                    <CardDescription className="text-yellow-700">
                        {booking.status === 'cancelled-by-guest' 
                        ? 'This booking was cancelled by you.'
                        : 'This booking was cancelled by the host.'}
                    </CardDescription>
                 </div>
              </CardHeader>
              {booking.cancellationReason && (
                 <CardContent>
                    <p className="font-semibold text-sm">Reason from host:</p>
                    <p className="text-muted-foreground italic">"{booking.cancellationReason}"</p>
                </CardContent>
              )}
            </Card>
          )}

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

        <div className="w-full lg:w-96 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{isCancelled ? "Original Booking Cost" : "Booking Summary"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-semibold">${booking.totalCost.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
            {isCancelled && (
                 <Card className="border-green-600 bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-6 h-6 text-green-700"/>
                            <span>Refund Summary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount Refunded</span>
                            <span className="font-semibold">${booking.totalCost.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">Your refund has been processed. Please allow 5-7 business days for it to appear on your statement.</p>
                    </CardContent>
                 </Card>
            )}

             {insurancePlan ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-green-600"/>
                            <span>Travel Insurance</span>
                        </CardTitle>
                        <CardDescription>{insurancePlan.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="font-medium text-sm">Your coverage benefits:</p>
                        <ul className="space-y-1">
                            {insurancePlan.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                        <Separator className="!mt-4"/>
                        <Button variant="link" asChild className="p-0 text-sm h-auto -ml-1">
                            <Link href={insurancePlan.termsUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="mr-1 h-4 w-4"/> View full policy details (PDF)
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
             ) : (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-amber-600"/>
                            <span>Travel Insurance</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No insurance plan was purchased for this trip.</p>
                    </CardContent>
                 </Card>
             )}
              {!isCancelled && (
                <Card>
                    <CardHeader><CardTitle>Need to make a change?</CardTitle></CardHeader>
                    <CardContent>
                        <Button variant="destructive" className="w-full" onClick={() => setIsCancelDialogOpen(true)}>Cancel Booking</Button>
                    </CardContent>
                </Card>
             )}
        </div>
      </div>
       {!isCancelled && <Chatbot booking={booking} property={property} />}
    </div>
     <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. You will receive a full refund for this booking.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="p-4 my-4 border rounded-md">
                <h4 className="font-semibold mb-2">Refund Details</h4>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount Paid</span>
                    <span>${booking.totalCost.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm font-semibold text-green-700 mt-1">
                    <span>Full Refund Amount</span>
                    <span>${booking.totalCost.toFixed(2)}</span>
                </div>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancellation} className="bg-destructive hover:bg-destructive/90">
                    Yes, Cancel Booking
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
