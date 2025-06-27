"use server";

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import type { Booking, Property, Faq } from './types';

const AnswerTripQuestionInputSchema = z.object({
  question: z.string(),
  booking: z.object({
    hasInsurance: z.boolean(),
  }),
  property: z.object({
    title: z.string(),
    location: z.string(),
  }),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
});

const AnswerTripQuestionOutputSchema = z.string();

const answerTripQuestionPrompt = ai.definePrompt(
  {
    name: "answerTripQuestionPrompt",
    input: { schema: AnswerTripQuestionInputSchema },
    output: { schema: AnswerTripQuestionOutputSchema },
    prompt: `You are a helpful assistant for a travel app called Airbnb. A user is asking a question about their booked trip. Answer the question based ONLY on the information provided below. Be friendly and conversational.

User's Question: "{{question}}"

Trip Information:
- Property: {{property.title}}
- Location: {{property.location}}
- Travel Insurance Purchased: {{#if booking.hasInsurance}}Yes{{else}}No{{/if}}

Property FAQs:
{{#if faqs.length}}
  {{#each faqs}}
  Q: {{this.question}}
  A: {{this.answer}}
  ---
  {{/each}}
{{else}}
(No FAQs provided for this property)
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
    const llmResponse = await answerTripQuestionPrompt(input);
    return llmResponse.output() ?? "I'm sorry, I couldn't generate a response.";
  }
);


type AnswerTripQuestionArgs = {
  question: string;
  booking: Booking;
  property: Property;
  faqs: Faq[];
};

export async function answerTripQuestion(args: AnswerTripQuestionArgs): Promise<string> {
  const input = {
    question: args.question,
    booking: { hasInsurance: args.booking.hasInsurance },
    property: { title: args.property.title, location: args.property.location },
    faqs: args.faqs,
  };

  try {
    const result = await answerTripQuestionFlow(input);
    return result;
  } catch (error) {
    console.error("Error in answerTripQuestionFlow:", error);
    return "I am sorry, but I encountered an error while trying to answer your question.";
  }
}
