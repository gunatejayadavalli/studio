'use server';

/**
 * @fileOverview A Genkit tool for reading insurance policy documents.
 *
 * - readInsurancePolicy - A tool that takes a URL and returns the text content of the policy document.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPDFContent } from '@/services/pdf-parser';

export const readInsurancePolicy = ai.defineTool(
  {
    name: 'readInsurancePolicy',
    description:
      'Reads the content of an insurance policy PDF to answer specific questions about coverage details, exclusions, and claim procedures.',
    inputSchema: z.object({
      url: z.string().describe('The URL of the insurance policy PDF.'),
    }),
    outputSchema: z.string().describe('The full text content of the policy document.'),
  },
  async (input) => {
    return getPDFContent(input.url);
  }
);
