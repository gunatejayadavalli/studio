
"use server";

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import type { Booking, Property } from './types';
import { insurancePlans } from './data';

const AnswerTripQuestionInputSchema = z.object({
  question: z.string(),
  booking: z.object({}),
  property: z.object({
    title: z.string(),
    location: z.string(),
    propertyInfo: z.string().optional(),
  }),
  insurancePlan: z.object({
    name: z.string(),
    benefits: z.array(z.string()),
  }).optional(),
});

const AnswerTripQuestionOutputSchema = z.string();

const answerTripQuestionPrompt = ai.definePrompt(
  {
    name: "answerTripQuestionPrompt",
    input: { schema: AnswerTripQuestionInputSchema },
    output: { schema: AnswerTripQuestionOutputSchema },
    prompt: `You are a helpful assistant for a travel app. A user is asking a question about their booked trip. Answer the question based ONLY on the information provided below. Be friendly and conversational.

User's Question: "{{question}}"

Trip Information:
- Property: {{property.title}}
- Location: {{property.location}}
- Travel Insurance Purchased: {{#if insurancePlan}}{{insurancePlan.name}}{{else}}No{{/if}}

{{#if insurancePlan}}
Insurance Benefits:
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
    console.log('AirBot flow received input:', JSON.stringify(input, null, 2));

    const llmResponse = await answerTripQuestionPrompt(input);
    console.log('AirBot flow received response from AI:', llmResponse);
    
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
    booking: {},
    property: { 
        title: args.property.title, 
        location: args.property.location,
        propertyInfo: args.property.propertyInfo,
    },
    insurancePlan: insurancePlan
      ? { name: insurancePlan.name, benefits: insurancePlan.benefits }
      : undefined,
  };

  try {
    const result = await answerTripQuestionFlow(input);
    return result;
  } catch (error) {
    console.error("Full error in answerTripQuestion:", error);
    return "I am sorry, but I encountered an error while trying to answer your question.";
  }
}
