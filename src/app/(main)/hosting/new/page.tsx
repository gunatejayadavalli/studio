
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import * as apiClient from '@/lib/api-client';
import { config } from '@/lib/config';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PropertyForm, type PropertyFormValues } from '@/components/property-form';

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  async function onSubmit(data: PropertyFormValues) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a property.' });
      return;
    }
    
    try {
      if (config.dataSource === 'api') {
        await apiClient.addProperty(data, user.id);
      } else {
        // In JSON mode, this does nothing but shows a toast.
        // A real implementation would add to a local state management solution.
        console.log('New property data (JSON mode):', data);
      }

      toast({
        title: 'Property Listed!',
        description: `${data.title} is now live.`,
      });
      router.push('/hosting');
      router.refresh(); // Refresh to show the new property if using API
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Failed to list property',
        description: 'An error occurred while creating the property.',
      });
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6">
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">List a New Property</CardTitle>
          <CardDescription>Fill out the details below to get your property online.</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyForm onSubmit={onSubmit} />
        </CardContent>
       </Card>
    </div>
  );
}
