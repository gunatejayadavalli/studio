
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Wifi, Wind, Utensils, Star, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useStaticData } from '@/hooks/use-static-data';

import type { Property } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import type { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from '@/components/ui/skeleton';

const amenityIcons: { [key: string]: React.ReactNode } = {
  'WiFi': <Wifi className="w-5 h-5 text-primary" />,
  'Air Conditioning': <Wind className="w-5 h-5 text-primary" />,
  'Kitchen': <Utensils className="w-5 h-5 text-primary" />,
};

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { allUsers } = useAuth();
  const { properties, isLoading } = useStaticData();
  const property = properties.find((p) => p.id === params.id);
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  });
  const [guests, setGuests] = useState(2);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-2/3" />
          <div className="flex items-center gap-4 mt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[500px] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl p-6 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    notFound();
  }
  
  const host = allUsers.find(u => u.id === property.hostId);

  const handleCheckout = () => {
    if (date?.from && date?.to) {
      const fromDate = format(date.from, 'yyyy-MM-dd');
      const toDate = format(date.to, 'yyyy-MM-dd');
      router.push(`/checkout/${property.id}?from=${fromDate}&to=${toDate}&guests=${guests}`);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-headline">{property.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground mt-2">
           <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-foreground">{property.rating}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-1">
            <MapPin className="w-5 h-5" />
            <span>{property.location}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-lg mb-8">
             <Image
                src={property.images[0]}
                alt={property.title}
                layout="fill"
                objectFit="cover"
              />
          </div>

          <div className="prose max-w-none text-foreground/90">
            <h2 className="text-2xl font-bold font-headline mb-4">About this place</h2>
            <p>{property.description}</p>
          </div>

          <Separator className="my-8" />
          
          <div>
            <h2 className="text-2xl font-bold font-headline mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 gap-4">
              {property.amenities.map(amenity => (
                <div key={amenity} className="flex items-center gap-3">
                  {amenityIcons[amenity] || <Star className="w-5 h-5 text-primary" />}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Separator className="my-8" />

          {host && (
            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">Hosted by {host.name}</h2>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={host.avatar} alt={host.name} />
                  <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground">Contact host for any inquiries about your stay.</p>
              </div>
            </div>
          )}

        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">
                <span className="font-bold text-2xl">${property.pricePerNight}</span>
                <span className="font-normal text-base text-muted-foreground"> / night</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                <Label>Select Dates</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={1}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
               </div>
                <div>
                  <Label htmlFor="guests">Guests</Label>
                  <Select
                    value={guests.toString()}
                    onValueChange={(value) => setGuests(parseInt(value))}
                  >
                    <SelectTrigger id="guests" className="w-full">
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          <div className="flex items-center gap-2">
                           <Users className="h-4 w-4"/> 
                           <span>{num} guest{num > 1 ? 's' : ''}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              <Button onClick={handleCheckout} className="w-full text-lg h-12" size="lg" disabled={!date?.from || !date?.to}>
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
