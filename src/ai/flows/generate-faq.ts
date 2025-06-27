// src/ai/flows/generate-faq.ts
'use server';

/**
 * @fileOverview Flow for generating initial FAQs for a property listing.
 *
 * - generateInitialFaq - A function that handles the FAQ generation process.
 * - GenerateInitialFaqInput - The input type for the generateInitialFaq function.
 * - GenerateInitialFaqOutput - The return type for the generateInitialFaq function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialFaqInputSchema = z.object({
  propertyDescription: z
    .string()
    .describe('Detailed description of the property listing.'),
  amenities: z
    .string()
    .describe('List of amenities available at the property.'),
});

export type GenerateInitialFaqInput = z.infer<typeof GenerateInitialFaqInputSchema>;

const GenerateInitialFaqOutputSchema = z.object({
  faqs: z
    .array(z.object({
      question: z.string().describe('Frequently asked question.'),
      answer: z.string().describe('Answer to the frequently asked question.'),
    }))
    .describe('Array of frequently asked questions and their answers.'),
});

export type GenerateInitialFaqOutput = z.infer<typeof GenerateInitialFaqOutputSchema>;

export async function generateInitialFaq(input: GenerateInitialFaqInput): Promise<GenerateInitialFaqOutput> {
  return generateInitialFaqFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialFaqPrompt',
  input: {schema: GenerateInitialFaqInputSchema},
  output: {schema: GenerateInitialFaqOutputSchema},
  prompt: `You are an experienced host assistant, helping hosts create helpful FAQs for their guests.

  Based on the property description and amenities, generate a list of FAQs that guests might have.

  Property Description: {{{propertyDescription}}}
  Amenities: {{{amenities}}}

  Format the output as a JSON array of objects, where each object has a "question" and "answer" field.
  Make sure to include questions about wifi, check-in, check-out, and directions to the property.
  Generate around 5-7 FAQs.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateInitialFaqFlow = ai.defineFlow(
  {
    name: 'generateInitialFaqFlow',
    inputSchema: GenerateInitialFaqInputSchema,
    outputSchema: GenerateInitialFaqOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
