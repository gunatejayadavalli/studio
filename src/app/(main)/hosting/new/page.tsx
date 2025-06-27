"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const propertyFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  location: z.string().min(3, 'Location is required'),
  pricePerNight: z.coerce.number().min(10, 'Price must be at least $10'),
  amenities: z.string().min(3, 'List at least one amenity'),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      pricePerNight: 100,
      amenities: 'WiFi, Kitchen',
    },
  });

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
    <div className="container mx-auto max-w-2xl py-8 px-4 md:px-6">
       <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">List a New Property</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sunny Beachside Villa" {...field} />
                    </FormControl>
                    <FormDescription>A catchy and descriptive title.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your amazing property..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Malibu, California" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerNight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Night (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <Input placeholder="WiFi, Pool, Kitchen..." {...field} />
                    </FormControl>
                     <FormDescription>Comma-separated list of amenities.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormItem>
                    <FormLabel>Image Upload</FormLabel>
                    <FormControl>
                      <Input type="file" disabled/>
                    </FormControl>
                     <FormDescription>Image upload is disabled in this demo.</FormDescription>
              </FormItem>

              <Button type="submit" size="lg">Create Listing</Button>
            </form>
          </Form>
        </CardContent>
       </Card>
    </div>
  );
}
