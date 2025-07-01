
"use client";

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useStaticData } from '@/hooks/use-static-data';
import { useBookings } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, BedDouble, Ban, Info } from 'lucide-react';
import { format } from 'date-fns';
import type { Booking } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function PropertyBookingsPage() {
  const params = useParams();
  const propertyId = parseInt(params.propertyId as string, 10);
  const { bookings, cancelBooking } = useBookings();
  const { allUsers: users } = useAuth();
  const { toast } = useToast();
  const { properties } = useStaticData();
  
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const property = properties.find((p) => p.id === propertyId);
  const propertyBookings = bookings.filter((b) => b.propertyId === propertyId).sort((a,b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  if (isNaN(propertyId) || !property) {
    notFound();
  }
  
  const handleCancellation = () => {
    if (!bookingToCancel || !cancellationReason.trim()) {
        toast({
            variant: "destructive",
            title: "Reason required",
            description: "Please provide a reason for cancelling the booking.",
        })
        return;
    }
    cancelBooking(bookingToCancel.id, 'host', cancellationReason);
    toast({
        title: "Booking Cancelled",
        description: "The booking has been successfully cancelled. The guest has been notified.",
    })
    setBookingToCancel(null);
    setCancellationReason("");
  }

  return (
    <>
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
            const isCancelled = booking.status !== 'confirmed';
            return (
              <Card key={booking.id} className={cn("overflow-hidden", isCancelled && "bg-muted/50")}>
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
                {isCancelled ? (
                     <CardFooter className="bg-destructive/10 p-4 border-t">
                        <div className="flex items-center gap-3 w-full">
                           <Ban className="w-5 h-5 text-destructive shrink-0"/>
                           <div className="text-sm">
                             <p className="font-semibold text-destructive">
                                {booking.status === 'cancelled-by-host' ? 'You cancelled this booking' : 'Cancelled by Guest'}
                             </p>
                             {booking.cancellationReason && (
                                <p className="text-destructive/80">Reason: "{booking.cancellationReason}"</p>
                             )}
                           </div>
                        </div>
                    </CardFooter>
                ) : (
                    <CardFooter className="p-4 border-t">
                        <Button variant="destructive" size="sm" onClick={() => setBookingToCancel(booking)}>
                            Cancel Booking
                        </Button>
                    </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
     <AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. The guest will be notified and issued a full refund.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
                <Label htmlFor="cancellation-reason">Reason for Cancellation</Label>
                <Textarea
                    id="cancellation-reason"
                    placeholder="e.g., Unforeseen maintenance issues"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {setBookingToCancel(null); setCancellationReason(""); }}>Back</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancellation} disabled={!cancellationReason.trim()}>
                    Confirm Cancellation
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
