
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import type { PropertyFormValues } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export const propertyFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  location: z.string().min(3, 'Location is required'),
  pricePerNight: z.coerce.number().min(10, 'Price must be at least $10'),
  amenities: z.string().min(3, 'List at least one amenity'),
  propertyInfo: z.string().optional(),
});


type PropertyFormProps = {
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  isEditing?: boolean;
  defaultValues?: PropertyFormValues;
};

export function PropertyForm({ onSubmit, isEditing = false, defaultValues }: PropertyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      pricePerNight: 100,
      amenities: 'WiFi, Kitchen',
      propertyInfo: '',
      ...defaultValues
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleFormSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  }

  return (
     <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Sunny Beachside Villa" {...field} disabled={isSubmitting}/>
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
                <Textarea placeholder="Describe your amazing property..." className="min-h-[120px]" {...field} disabled={isSubmitting}/>
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
                <Input placeholder="e.g., Malibu, California" {...field} disabled={isSubmitting}/>
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
                <Input type="number" placeholder="150" {...field} disabled={isSubmitting}/>
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
                <Input placeholder="WiFi, Pool, Kitchen..." {...field} disabled={isSubmitting}/>
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

        <Separator />
        
        <FormField
          control={form.control}
          name="propertyInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Information</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide details like WiFi password, check-in instructions, directions, etc." className="min-h-[150px] font-code" {...field} disabled={isSubmitting}/>
              </FormControl>
               <FormDescription>This information will be available to guests after booking and used by the AirBot to answer questions.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-6" />
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin mr-2" />}
          {isEditing ? 'Save Changes' : 'Create Listing'}
        </Button>
      </form>
    </Form>
  );
}
