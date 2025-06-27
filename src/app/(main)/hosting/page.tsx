
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
            const bookingsCount = bookings.filter(b => b.propertyId === property.id).length;
            return (
                <Card key={property.id} className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <Link href={`/hosting/edit/${property.id}`} className="group block flex-grow flex flex-col">
                      <CardHeader className="p-0">
                         <div className="relative h-48 w-full">
                          <Image
                            src={property.thumbnail}
                            alt={property.title}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow">
                         <CardTitle className="text-lg font-headline mb-2 group-hover:text-primary">{property.title}</CardTitle>
                         <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{property.description}</p>
                      </CardContent>
                    </Link>
                    <CardFooter className="p-4 bg-muted/50 mt-auto flex items-center gap-2">
                       <Button asChild variant="outline" className="flex-1">
                           <Link href={`/hosting/edit/${property.id}`}>
                               <Edit className="mr-2 h-4 w-4"/> Manage
                           </Link>
                       </Button>
                       <Button asChild className="flex-1">
                           <Link href={`/hosting/bookings/${property.id}`}>
                               <Briefcase className="mr-2 h-4 w-4"/> Bookings ({bookingsCount})
                           </Link>
                       </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>
    </div>
  );
}
