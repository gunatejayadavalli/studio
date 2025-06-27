"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, notFound, useParams } from 'next/navigation';
import { differenceInDays, format, parseISO } from 'date-fns';
import { properties } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const property = properties.find((p) => p.id === params.id);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  
  const [addInsurance, setAddInsurance] = useState(false);

  if (!property || !from || !to) {
    return notFound();
  }

  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  const numberOfNights = differenceInDays(toDate, fromDate);
  const basePrice = property.pricePerNight * numberOfNights;
  const serviceFee = basePrice * 0.1;
  const insuranceCost = addInsurance ? basePrice * 0.05 : 0;
  const totalCost = basePrice + serviceFee + insuranceCost;

  const handleBooking = () => {
    // In a real app, this would call an API to create a booking.
    console.log("Booking confirmed for:", {
      propertyId: property.id,
      from,
      to,
      totalCost,
      hasInsurance: addInsurance,
    });
    toast({
      title: "Booking Confirmed!",
      description: `Your trip to ${property.title} is booked.`,
    });
    router.push('/confirmation');
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 md:px-6">
       <h1 className="text-3xl font-bold font-headline mb-6">Confirm and Pay</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
               <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={property.thumbnail}
                    alt={property.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              <div>
                <p className="text-sm text-muted-foreground">Stay at</p>
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{property.location}</p>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <div>
                  <h3 className="font-semibold mb-2">Your trip</h3>
                  <div className="flex justify-between">
                    <p className="font-medium">Dates</p>
                    <p>{format(fromDate, "MMM d")} - {format(toDate, "MMM d, yyyy")}</p>
                  </div>
              </div>
              <Separator />
               <div>
                <h3 className="font-semibold mb-2">Travel Insurance</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="insurance-switch">Add Insurance</Label>
                    <p className="text-sm text-muted-foreground">Protect your trip from the unexpected.</p>
                  </div>
                  <Switch
                    id="insurance-switch"
                    checked={addInsurance}
                    onCheckedChange={setAddInsurance}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>${property.pricePerNight} x {numberOfNights} nights</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              {addInsurance && (
                <div className="flex justify-between">
                  <span>Travel Insurance</span>
                  <span>${insuranceCost.toFixed(2)}</span>
                </div>
              )}
            </CardContent>
            <Separator className="my-4"/>
            <CardFooter className="flex justify-between font-bold text-lg">
                <span>Total (USD)</span>
                <span>${totalCost.toFixed(2)}</span>
            </CardFooter>
            <div className="px-6 pb-6">
                <Button onClick={handleBooking} className="w-full h-12 text-lg" size="lg">
                    Proceed to Book
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
