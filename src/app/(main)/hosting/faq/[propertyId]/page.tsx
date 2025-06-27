"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateInitialFaq } from '@/ai/flows/generate-faq';

import { properties, faqs as initialFaqs } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, PlusCircle, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters."),
  answer: z.string().min(10, "Answer must be at least 10 characters."),
});

const faqFormSchema = z.object({
  faqs: z.array(faqSchema),
});

type FaqFormValues = z.infer<typeof faqFormSchema>;

export default function FaqPage() {
  const params = useParams();
  const property = properties.find((p) => p.id === params.propertyId);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      faqs: [],
    },
  });
  
  useEffect(() => {
    const propertyFaqs = initialFaqs.filter(f => f.propertyId === params.propertyId);
    form.reset({ faqs: propertyFaqs.map(({ question, answer }) => ({ question, answer })) });
  }, [params.propertyId, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  if (!property) {
    notFound();
  }

  const handleGenerateFaqs = async () => {
    setIsGenerating(true);
    try {
      const result = await generateInitialFaq({
        propertyDescription: property.description,
        amenities: property.amenities.join(', '),
      });
      
      // Replace existing FAQs with generated ones
      form.setValue('faqs', result.faqs, { shouldValidate: true });

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
  
  function onSubmit(data: FaqFormValues) {
    // In a real app, this would save the FAQs to the database.
    console.log("Saving FAQs for property", params.propertyId, data);
    toast({
      title: "FAQs Saved",
      description: "Your changes have been saved successfully.",
    });
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Manage FAQs for {property.title}</CardTitle>
          <CardDescription>Add or edit frequently asked questions for your guests. These will be used by the AI chatbot.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleGenerateFaqs} disabled={isGenerating}>
              <Bot className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <Separator className="my-4"/>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <Separator className="my-4"/>

              <Button type="submit" size="lg">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
