
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useStaticData } from '@/hooks/use-static-data';
import { PropertyCard } from '@/components/property-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export default function HomePage() {
  const { user } = useAuth();
  const { properties, isLoading } = useStaticData();
  const [sortOrder, setSortOrder] = useState('default');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold font-headline mb-2">Explore Stays</h1>
        <p className="text-muted-foreground mb-8">Finding your next getaway...</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const availableProperties = user 
    ? properties.filter(property => property.hostId !== user.id)
    : properties;

  const sortedProperties = [...availableProperties].sort((a, b) => {
    if (sortOrder === 'price-asc') {
      return a.pricePerNight - b.pricePerNight;
    }
    if (sortOrder === 'price-desc') {
      return b.pricePerNight - a.pricePerNight;
    }
    return 0; // Default order
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
       <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-2">Explore Stays</h1>
          <p className="text-muted-foreground">Find your next getaway from our curated list of properties.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Label htmlFor="sort-order" className="sr-only">Sort by</Label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger id="sort-order" className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sort by...</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
