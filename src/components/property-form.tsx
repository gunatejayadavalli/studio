
"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { generateInitialFaq } from '@/ai/flows/generate-faq';

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
import { Trash2, PlusCircle, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters."),
  answer: z.string().min(10, "Answer must be at least 10 characters."),
});

export const propertyFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  location: z.string().min(3, 'Location is required'),
  pricePerNight: z.coerce.number().min(10, 'Price must be at least $10'),
  amenities: z.string().min(3, 'List at least one amenity'),
  faqs: z.array(faqSchema),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

type PropertyFormProps = {
  onSubmit: (data: PropertyFormValues) => void;
  isEditing?: boolean;
  defaultValues?: PropertyFormValues;
};

export function PropertyForm({ onSubmit, isEditing = false, defaultValues }: PropertyFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      pricePerNight: 100,
      amenities: 'WiFi, Kitchen',
      faqs: [],
      ...defaultValues
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const handleGenerateFaqs = async () => {
    setIsGenerating(true);
    const propertyData = form.getValues();
    if (!propertyData.description || !propertyData.amenities) {
       toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in the description and amenities before generating FAQs.",
      });
      setIsGenerating(false);
      return;
    }

    try {
      const result = await generateInitialFaq({
        propertyDescription: propertyData.description,
        amenities: propertyData.amenities,
      });
      
      replace(result.faqs);

      toast({
        title: "FAQs Generated",
        description: "AI-powered FAQs have been added. Review and save.",
      });
    } catch (error) {
      console.error("Failed to generate FAQs:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate FAQs at this time.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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

        <Separator />
        
        <div>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
              <p className="text-sm text-muted-foreground">Add FAQs to help guests and the AI assistant.</p>
            </div>
            <Button type="button" onClick={handleGenerateFaqs} disabled={isGenerating}>
              <Bot className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <div className="space-y-4">
             {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <FormField
                    control={form.control}
                    name={`faqs.${index}.question`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`faqs.${index}.answer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="font-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
               <Button type="button" variant="outline" onClick={() => append({ question: '', answer: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
              </Button>
          </div>
        </div>
        <Separator className="my-6" />
        <Button type="submit" size="lg">{isEditing ? 'Save Changes' : 'Create Listing'}</Button>
      </form>
    </Form>
  );
}
