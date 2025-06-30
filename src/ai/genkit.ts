import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

console.log('Initializing AI with Google AI provider.');

// The googleAI() plugin can find default credentials if GOOGLE_API_KEY is not set.
// No explicit key check is needed here.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
