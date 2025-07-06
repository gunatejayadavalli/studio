// src/ai/flows/suggest-insurance.ts
'use server';

/**
 * @fileOverview An AI agent that generates a friendly message suggesting travel insurance.
 *
 * - suggestInsuranceMessage - A function that generates an insurance suggestion message.
 * - SuggestInsuranceMessageInput - The input type for the suggestInsuranceMessage function.
 * - SuggestInsuranceMessageOutput - The return type for the suggestInsuranceMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInsuranceMessageInputSchema = z.object({
  location: z.string().describe('The location of the trip.'),
  tripCost: z.number().describe('The total cost of the trip.'),
});
export type SuggestInsuranceMessageInput = z.infer<typeof SuggestInsuranceMessageInputSchema>;

const SuggestInsuranceMessageOutputSchema = z.object({
  message: z.string().describe('A friendly, encouraging message about travel insurance.'),
});
export type SuggestInsuranceMessageOutput = z.infer<typeof SuggestInsuranceMessageOutputSchema>;

export async function suggestInsuranceMessage(input: SuggestInsuranceMessageInput): Promise<SuggestInsuranceMessageOutput> {
  return suggestInsuranceMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInsuranceMessagePrompt',
  input: {schema: SuggestInsuranceMessageInputSchema},
  output: {schema: SuggestInsuranceMessageOutputSchema},
  prompt: `You are a helpful travel assistant. A user is booking a trip to {{location}} with a total cost of \${{tripCost}}.

Write a short, friendly, and encouraging message (2-3 sentences) highlighting the high-level benefits of purchasing travel insurance for this trip. Mention peace of mind and protection against unexpected events like cancellations or delays. Frame it as a helpful suggestion, not a hard sell.

The response MUST be a single message in the format defined by the output schema.`, 
});

const suggestInsuranceMessageFlow = ai.defineFlow(
  {
    name: 'suggestInsuranceMessageFlow',
    inputSchema: SuggestInsuranceMessageInputSchema,
    outputSchema: SuggestInsuranceMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);