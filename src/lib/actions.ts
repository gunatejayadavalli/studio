
"use server";

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import type { Booking, Property } from './types';
import { insurancePlans } from './data';
import { readInsurancePolicy } from '@/ai/tools/insurance-policy-reader';

const AnswerTripQuestionInputSchema = z.object({
  question: z.string(),
  booking: z.object({
    checkIn: z.string().describe("The check-in date for the trip (YYYY-MM-DD)."),
    checkOut: z.string().describe("The check-out date for the trip (YYYY-MM-DD)."),
  }),
  property: z.object({
    title: z.string(),
    location: z.string(),
    propertyInfo: z.string().optional(),
  }),
  insurancePlan: z.object({
    name: z.string(),
    benefits: z.array(z.string()),
  }).optional(),
  insurancePolicyUrl: z.string().optional().describe('The URL to the full insurance policy PDF.'),
});

const AnswerTripQuestionOutputSchema = z.string();

const answerTripQuestionPrompt = ai.definePrompt(
  {
    name: "answerTripQuestionPrompt",
    input: { schema: AnswerTripQuestionInputSchema },
    output: { schema: AnswerTripQuestionOutputSchema },
    tools: [readInsurancePolicy],
    prompt: `You are a helpful assistant for a travel app. A user is asking a question about their booked trip. Answer the question based ONLY on the information provided below. Be friendly and conversational.

If the user asks a specific question about insurance coverage that isn't covered by the high-level benefits list (e.g., questions about specific exclusions, claim procedures, or detailed coverage amounts), use the \`readInsurancePolicy\` tool to get the full policy details from the provided URL and answer the question based on that content. Do not make up information.

User's Question: "{{question}}"

Trip Information:
- Property: {{property.title}}
- Location: {{property.location}}
- Check-in Date: {{booking.checkIn}}
- Check-out Date: {{booking.checkOut}}
- Travel Insurance Purchased: {{#if insurancePlan}}{{insurancePlan.name}}{{else}}No{{/if}}

{{#if insurancePlan}}
High-level Insurance Benefits:
{{#each insurancePlan.benefits}}
- {{this}}
{{/each}}
{{/if}}

Property Information from Host:
{{#if property.propertyInfo}}
{{property.propertyInfo}}
{{else}}
(No additional information was provided by the host for this property)
{{/if}}

Your Answer:`,
  },
);

const answerTripQuestionFlow = ai.defineFlow(
  {
    name: "answerTripQuestionFlow",
    inputSchema: AnswerTripQuestionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    console.log('[AirBot Flow] Received input:', JSON.stringify(input, null, 2));

    const llmResponse = await answerTripQuestionPrompt(input);
    console.log('[AirBot Flow] Received response from AI:', JSON.stringify(llmResponse, null, 2));
    
    return llmResponse.output ?? "I'm sorry, I couldn't generate a response at this moment.";
  }
);


type AnswerTripQuestionArgs = {
  question: string;
  booking: Booking;
  property: Property;
};

export async function answerTripQuestion(args: AnswerTripQuestionArgs): Promise<string> {
  const insurancePlan = args.booking.insurancePlanId
    ? insurancePlans.find((p) => p.id === args.booking.insurancePlanId)
    : undefined;

  const input = {
    question: args.question,
    booking: {
        checkIn: args.booking.checkIn,
        checkOut: args.booking.checkOut,
    },
    property: { 
        title: args.property.title, 
        location: args.property.location,
        propertyInfo: args.property.propertyInfo,
    },
    insurancePlan: insurancePlan
      ? { name: insurancePlan.name, benefits: insurancePlan.benefits }
      : undefined,
    insurancePolicyUrl: insurancePlan?.termsUrl,
  };

  try {
    const result = await answerTripQuestionFlow(input);
    return result;
  } catch (error) {
    console.error("Full error in answerTripQuestion:", error);
    return "I am sorry, but I encountered an error while trying to answer your question.";
  }
}
