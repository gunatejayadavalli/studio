// src/ai/flows/suggest-insurance.ts
'use server';

/**
 * @fileOverview An AI agent that suggests relevant travel insurance options based on trip details.
 *
 * - suggestInsuranceOptions - A function that suggests insurance options based on trip details.
 * - SuggestInsuranceOptionsInput - The input type for the suggestInsuranceOptions function.
 * - SuggestInsuranceOptionsOutput - The return type for the suggestInsuranceOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInsuranceOptionsInputSchema = z.object({
  location: z.string().describe('The location of the trip.'),
  startDate: z.string().describe('The start date of the trip (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date of the trip (YYYY-MM-DD).'),
  tripCost: z.number().describe('The total cost of the trip.'),
});
export type SuggestInsuranceOptionsInput = z.infer<typeof SuggestInsuranceOptionsInputSchema>;

const SuggestInsuranceOptionsOutputSchema = z.object({
  insuranceOptions: z.array(
    z.object({
      name: z.string().describe('The name of the insurance option.'),
      description: z.string().describe('A description of the insurance option.'),
      price: z.number().describe('The price of the insurance option.'),
      coverageDetails: z.string().describe('Detailed coverage information for the option.'),
    })
  ).describe('A list of suggested insurance options.'),
});
export type SuggestInsuranceOptionsOutput = z.infer<typeof SuggestInsuranceOptionsOutputSchema>;

export async function suggestInsuranceOptions(input: SuggestInsuranceOptionsInput): Promise<SuggestInsuranceOptionsOutput> {
  return suggestInsuranceOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInsuranceOptionsPrompt',
  input: {schema: SuggestInsuranceOptionsInputSchema},
  output: {schema: SuggestInsuranceOptionsOutputSchema},
  prompt: `Suggest relevant travel insurance options based on the following trip details:

Location: {{location}}
Start Date: {{startDate}}
End Date: {{endDate}}
Trip Cost: {{tripCost}}

Consider the trip details to suggest suitable insurance options. Provide a variety of options with different coverage levels and price points.

Ensure each insurance option includes a name, description, price, and coverage details. The response MUST be in the format defined by the output schema.`, 
});

const suggestInsuranceOptionsFlow = ai.defineFlow(
  {
    name: 'suggestInsuranceOptionsFlow',
    inputSchema: SuggestInsuranceOptionsInputSchema,
    outputSchema: SuggestInsuranceOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
