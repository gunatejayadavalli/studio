'use server';

/**
 * @fileOverview Simulates fetching and parsing PDF content from a URL.
 */

const DUMMY_POLICY_CONTENT = `
Global Travel Insurance - Official Policy Document

Section 1: Trip Cancellation
Coverage is provided for up to the amount specified in your plan if you are prevented from taking your trip due to unforeseen circumstances such as:
- Sickness, injury, or death of you, a family member, or a traveling companion.
- Your home or destination being made uninhabitable by fire, flood, or natural disaster.
- Being required to serve on a jury or subpoenaed in a court of law.
Exclusions: This benefit does not cover cancellation due to pre-existing medical conditions not stable for 60 days prior to purchase, or cancellation due to work-related obligations.

Section 2: Medical Emergency
We cover emergency medical expenses up to the plan limit. This includes physician services, hospital charges, and ambulance services.
Exclusions: Does not cover routine physical exams, cosmetic surgery, or expenses related to alcohol or drug abuse.

Section 3: Baggage Loss/Delay
If your baggage is delayed for more than 12 hours, we will reimburse you for the purchase of essential items up to $100 per day, to a maximum of $500. If your baggage is lost or stolen, we will cover up to the plan limit for the replacement of your belongings.
Exclusions: Does not cover cash, securities, or tickets. A police report is required for theft claims.

Section 4: Filing a Claim
To file a claim, please visit our online portal and submit the required documentation within 30 days of the incident. Required documents may include receipts, medical reports, or police reports.

For full details, please contact our 24/7 support line.
`;

/**
 * Simulates reading the content of a PDF from a given URL.
 * In a real application, this would involve fetching the PDF and using a library like pdf-parse.
 * For this demo, it returns a hardcoded string.
 * @param url - The URL of the PDF to "parse".
 * @returns A promise that resolves to the text content of the PDF.
 */
export async function getPDFContent(url: string): Promise<string> {
  console.log(`[PDF Parser Service] Simulating parsing for URL: ${url}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return DUMMY_POLICY_CONTENT;
}
