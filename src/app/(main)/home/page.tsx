"use client";

import { useAuth } from '@/hooks/use-auth';
import { useStaticData } from '@/hooks/use-static-data';
import { PropertyCard } from '@/components/property-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user } = useAuth();
  const { properties, isLoading } = useStaticData();

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

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold font-headline mb-2">Explore Stays</h1>
      <p className="text-muted-foreground mb-8">Find your next getaway from our curated list of properties.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {availableProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
