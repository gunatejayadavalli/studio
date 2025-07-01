
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useStaticData } from '@/hooks/use-static-data';
import { useBookings } from '@/hooks/use-bookings';
import { config } from '@/lib/config';
import * as apiClient from '@/lib/api-client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PropertyForm, type PropertyFormValues } from '@/components/property-form';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from '@/components/ui/separator';
import { Briefcase, ArrowLeft } from 'lucide-react';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { bookings } = useBookings();
  const { properties, isLoading } = useStaticData();

  const propertyId = parseInt(params.propertyId as string, 10);
  const property = properties.find((p) => p.id === propertyId);
  
  const [defaultValues, setDefaultValues] = useState<PropertyFormValues | undefined>(undefined);
  
  const hasActiveBookings = bookings.some(
    (b) => b.propertyId === propertyId && b.status === 'confirmed'
  );

  useEffect(() => {
    if (property) {
      setDefaultValues({
        ...property,
        amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
        propertyInfo: property.propertyInfo || '',
      });
    }
  }, [property]);
  
  if (isLoading) {
    return (
        <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6">
            <p>Loading...</p>
        </div>
    );
  }
  
  if (isNaN(propertyId) || !property) {
    notFound();
  }

  async function onSubmit(data: PropertyFormValues) {
    try {
      if (config.dataSource === 'api') {
        await apiClient.updateProperty(propertyId, data);
      } else {
        console.log('Updated property data (JSON mode):', data);
      }
      toast({
        title: 'Property Updated!',
        description: `Your changes to ${data.title} have been saved.`,
      });
      router.push('/hosting');
      router.refresh();
    } catch (error) {
       toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save changes to the property.' });
    }
  }

  async function handleDelete() {
    try {
      if (config.dataSource === 'api') {
        await apiClient.deleteProperty(propertyId);
      } else {
         console.log('Deleting property (JSON mode):', propertyId);
      }
      toast({
        title: 'Property Deleted',
        description: `${property?.title} has been removed.`,
      });
      router.push('/hosting');
      router.refresh();
    } catch (error) {
       toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the property.' });
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6">
      <div className="mb-4">
        <Button variant="outline" asChild>
            <Link href="/hosting"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings</Link>
        </Button>
      </div>
       <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-bold font-headline">Edit Listing</CardTitle>
              <CardDescription>{property.title}</CardDescription>
            </div>
             <Button variant="secondary" asChild>
                <Link href={`/hosting/bookings/${property.id}`}><Briefcase className="mr-2 h-4 w-4"/> View Bookings</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {defaultValues && <PropertyForm onSubmit={onSubmit} isEditing={true} defaultValues={defaultValues} />}
          <Separator className="my-8"/>
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
             <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-destructive/80 mb-4">Deleting your property is a permanent action and cannot be undone.</p>
              {hasActiveBookings && (
                <p className="text-sm text-destructive font-medium mb-4">
                  This property cannot be deleted because it has active bookings.
                </p>
              )}
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={hasActiveBookings}>Delete Property</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      property and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Yes, delete property
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </div>
        </CardContent>
       </Card>
    </div>
  );
}
