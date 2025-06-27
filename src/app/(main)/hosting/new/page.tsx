
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PropertyForm, type PropertyFormValues } from '@/components/property-form';

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();

  function onSubmit(data: PropertyFormValues) {
    // In a real app, this would call an API to create the property
    console.log('New property data:', data);
    toast({
      title: 'Property Listed!',
      description: `${data.title} is now live.`,
    });
    router.push('/hosting');
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
