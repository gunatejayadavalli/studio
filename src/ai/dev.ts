import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-reviews.ts';
import '@/ai/flows/suggest-insurance.ts';
import '@/ai/tools/insurance-policy-reader.ts';
