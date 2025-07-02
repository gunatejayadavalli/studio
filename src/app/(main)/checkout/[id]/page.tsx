
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, notFound, useParams, useSearchParams } from 'next/navigation';
import { differenceInDays, format, parseISO } from 'date-fns';
import { useStaticData } from '@/hooks/use-static-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useBookings } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { CheckCircle, Info, FileText, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const { properties, insurancePlans, isLoading: isDataLoading } = useStaticData();

  const propertyId = parseInt(params.id as string, 10);
  const property = properties.find((p) => p.id === propertyId);

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const guests = searchParams.get('guests') || '2';
  
  const [selectedInsurancePlanId, setSelectedInsurancePlanId] = useState<string | null>(null);
  const [isBenefitDialogOpen, setIsBenefitDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  if (isDataLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 md:px-6">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
          <Card className="sticky top-24">
            <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between font-bold text-lg">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
            </CardFooter>
             <div className="px-6 pb-6"><Skeleton className="h-12 w-full" /></div>
          </Card>
        </div>
      </div>
    );
  }

  if (isNaN(propertyId) || !property || !from || !to) {
    return notFound();
  }

  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  const numberOfNights = differenceInDays(toDate, fromDate);
  const reservationCost = property.pricePerNight * numberOfNights;
  
  const eligiblePlan = insurancePlans.find(plan => reservationCost >= plan.minTripValue && reservationCost < plan.maxTripValue);
  
  const insuranceCost = eligiblePlan && selectedInsurancePlanId ? (reservationCost * eligiblePlan.pricePercent) / 100 : 0;
  
  const serviceFee = reservationCost * 0.1;
  const totalCost = reservationCost + serviceFee + insuranceCost;

  const handleBooking = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to make a booking.",
        });
        return;
    }
    
    if (isBooking) return;
    setIsBooking(true);

    await addBooking({
      propertyId: property.id,
      checkIn: from,
      checkOut: to,
      totalCost: totalCost,
      insurancePlanId: selectedInsurancePlanId ?? undefined,
      guests: parseInt(guests, 10),
      reservationCost: reservationCost,
      serviceFee: serviceFee,
      insuranceCost: insuranceCost,
    });

    toast({
      title: "Booking Confirmed!",
      description: `Your trip to ${property.title} is booked.`,
    });
    router.push('/confirmation');
  };

  const handleInsuranceToggle = (checked: boolean) => {
    if (checked && eligiblePlan) {
      setSelectedInsurancePlanId(eligiblePlan.id);
    } else {
      setSelectedInsurancePlanId(null);
    }
  };


  return (
    <>
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
                   <div className="flex justify-between mt-2">
                    <p className="font-medium">Guests</p>
                    <p>{guests} guest{parseInt(guests, 10) > 1 ? 's' : ''}</p>
                  </div>
              </div>
              <Separator />
               {eligiblePlan && (
                <div>
                  <h3 className="font-semibold mb-2">Travel Insurance</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="insurance-switch" className="font-medium">{eligiblePlan.name}</Label>
                      <p className="text-sm text-muted-foreground">Protect your trip from the unexpected.</p>
                      <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setIsBenefitDialogOpen(true)}>
                        <Info className="mr-1 h-4 w-4"/> View benefits
                      </Button>
                    </div>
                    <Switch
                      id="insurance-switch"
                      checked={!!selectedInsurancePlanId}
                      onCheckedChange={handleInsuranceToggle}
                    />
                  </div>
                </div>
               )}
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
                <span>${property.pricePerNight.toFixed(2)} x {numberOfNights} nights</span>
                <span>${reservationCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              {selectedInsurancePlanId && eligiblePlan && (
                <div className="flex justify-between">
                  <span>Travel Insurance ({eligiblePlan.name})</span>
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
                <Button onClick={handleBooking} className="w-full h-12 text-lg" size="lg" disabled={isBooking}>
                    {isBooking ? (
                        <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Confirm and Pay'
                    )}
                </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
    {eligiblePlan && (
        <AlertDialog open={isBenefitDialogOpen} onOpenChange={setIsBenefitDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Coverage benefits for {eligiblePlan.name}</AlertDialogTitle>
                <AlertDialogDescription>
                    This plan includes the following benefits for your trip.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-4">
                    {eligiblePlan.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <p>{benefit}</p>
                        </div>
                    ))}
                </div>
                <div className="pt-2">
                  <Button variant="link" asChild className="p-0 text-sm h-auto">
                      <Link href={eligiblePlan.termsUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-1 h-4 w-4"/> View full policy details (PDF)
                      </Link>
                  </Button>
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </>
  );
}

    
