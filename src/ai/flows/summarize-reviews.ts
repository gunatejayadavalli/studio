// Summarize reviews.

'use server';

/**
 * @fileOverview Summarizes recent guest reviews to identify common themes, both positive and negative.
 *
 * - summarizeReviews - A function that summarizes the reviews.
 * - SummarizeReviewsInput - The input type for the summarizeReviews function.
 * - SummarizeReviewsOutput - The return type for the summarizeReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReviewsInputSchema = z.object({
  reviews: z.array(
    z.object({
      author: z.string().describe('The name of the review author.'),
      text: z.string().describe('The text content of the review.'),
      rating: z.number().describe('The rating given by the reviewer.'),
    })
  ).describe('An array of guest reviews.'),
});
export type SummarizeReviewsInput = z.infer<typeof SummarizeReviewsInputSchema>;

const SummarizeReviewsOutputSchema = z.object({
  positiveThemes: z.string().describe('A summary of the positive themes from the reviews.'),
  negativeThemes: z.string().describe('A summary of the negative themes from the reviews.'),
  overallSentiment: z.string().describe('A brief statement of the overall sentiment.'),
});
export type SummarizeReviewsOutput = z.infer<typeof SummarizeReviewsOutputSchema>;

export async function summarizeReviews(input: SummarizeReviewsInput): Promise<SummarizeReviewsOutput> {
  return summarizeReviewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReviewsPrompt',
  input: {schema: SummarizeReviewsInputSchema},
  output: {schema: SummarizeReviewsOutputSchema},
  prompt: `You are a hospitality expert, tasked with summarizing guest reviews for property owners.

  Analyze the following reviews to identify common positive and negative themes, and provide an overall sentiment.
  Return the results in a JSON format.

  Reviews:
  {{#each reviews}}
  Author: {{this.author}}
  Rating: {{this.rating}}
  Text: {{this.text}}
  ---\n  {{/each}}

  Here is the summary:
  Overall Sentiment: {{overallSentiment}}
  Positive Themes: {{positiveThemes}}
  Negative Themes: {{negativeThemes}}`,
});

const summarizeReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeReviewsFlow',
    inputSchema: SummarizeReviewsInputSchema,
    outputSchema: SummarizeReviewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
