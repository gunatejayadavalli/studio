"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { properties, bookings } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Briefcase } from 'lucide-react';

export default function HostingPage() {
  const { user } = useAuth();
  const hostProperties = properties.filter((p) => p.hostId === user?.id);

  if (hostProperties.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Host Dashboard</h1>
        <p className="text-muted-foreground mb-6">You haven't listed any properties yet.</p>
        <Button asChild size="lg">
          <Link href="/hosting/new"><PlusCircle className="mr-2 h-5 w-5"/> Add Your First Property</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Your Listings</h1>
        <Button asChild>
          <Link href="/hosting/new"><PlusCircle className="mr-2 h-4 w-4"/> Add New Listing</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostProperties.map((property) => {
          const propertyBookingsCount = bookings.filter(b => b.propertyId === property.id).length;
          return (
            <Card key={property.id} className="flex flex-col">
              <CardHeader className="p-0">
                 <div className="relative h-48 w-full">
                  <Image
                    src={property.thumbnail}
                    alt={property.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                 <CardTitle className="text-lg font-headline mb-2">{property.title}</CardTitle>
                 <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{property.description}</p>
              </CardContent>
              <CardFooter className="p-4 flex flex-wrap justify-end gap-2">
                <Button variant="secondary" asChild>
                  <Link href={`/hosting/bookings/${property.id}`}><Briefcase className="mr-2 h-4 w-4"/> View Bookings ({propertyBookingsCount})</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/hosting/faq/${property.id}`}><Edit className="mr-2 h-4 w-4"/> Manage FAQs</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
