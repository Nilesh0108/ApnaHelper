'use server';
/**
 * @fileOverview An AI assistant flow to help customers clearly describe their service requests.
 *
 * - customerJobDescriptionAssistant - A function that assists customers in refining job descriptions.
 * - CustomerJobDescriptionAssistantInput - The input type for the customerJobDescriptionAssistant function.
 * - CustomerJobDescriptionAssistantOutput - The return type for the customerJobDescriptionAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const CustomerJobDescriptionAssistantInputSchema = z.object({
  serviceType: z
    .string()
    .describe('The category of the service requested (e.g., "Plumbing", "Electrical").'),
  currentDescription: z
    .string()
    .describe(
      'The customer\'s current job description, potentially accumulated from previous interactions.'
    ),
});
export type CustomerJobDescriptionAssistantInput = z.infer<
  typeof CustomerJobDescriptionAssistantInputSchema
>;

// Output Schema
const CustomerJobDescriptionAssistantOutputSchema = z.object({
  refinedDescription: z
    .string()
    .describe('The AI-refined, clearer version of the job description.'),
  clarifyingQuestionsOrSuggestions: z
    .array(z.string())
    .describe(
      'A list of clarifying questions for the customer or suggestions for additional details needed.'
    ),
  isSufficient: z
    .boolean()
    .describe(
      'True if the AI believes the description is sufficiently clear for a worker; otherwise, false.'
    ),
});
export type CustomerJobDescriptionAssistantOutput = z.infer<
  typeof CustomerJobDescriptionAssistantOutputSchema
>;

// Wrapper function to call the flow
export async function customerJobDescriptionAssistant(
  input: CustomerJobDescriptionAssistantInput
): Promise<CustomerJobDescriptionAssistantOutput> {
  return customerJobDescriptionAssistantFlow(input);
}

// Define the prompt
const customerJobDescriptionAssistantPrompt = ai.definePrompt({
  name: 'customerJobDescriptionAssistantPrompt',
  input: { schema: CustomerJobDescriptionAssistantInputSchema },
  output: { schema: CustomerJobDescriptionAssistantOutputSchema },
  prompt: `You are a helpful AI assistant specialized in home service work. Your primary goal is to assist customers in creating clear, detailed, and unambiguous job descriptions for service workers.\n\nGiven the 'serviceType' and the 'currentDescription' provided by the customer, analyze the information.\n\nIf the 'currentDescription' is brief or lacks essential details, generate a set of 'clarifyingQuestionsOrSuggestions' to prompt the customer for more information. These should be specific and relevant to the 'serviceType'.\nIf the 'currentDescription' already contains good detail, refine it into a polished 'refinedDescription'. If there are still minor ambiguities or common missing details for the 'serviceType', you may still include some 'clarifyingQuestionsOrSuggestions'.\n\nDetermine if the 'refinedDescription' is now comprehensive enough for a worker to understand the job without further questions. Set 'isSufficient' to true if it is, and false otherwise.\n\nConsider the following examples for 'clarifyingQuestionsOrSuggestions' based on 'serviceType':\n- For 'Plumbing': "What is the exact location of the leak (e.g., under the sink, near the toilet base)?", "What type of fixture is leaking (e.g., faucet, pipe, toilet)?", "How long has the leak been occurring?", "Is there any visible damage to the surrounding area?", "What is the urgency of this repair?"\n- For 'Electrical': "Where is the faulty wiring or device located (e.g., kitchen outlet, bedroom light switch)?", "What specific electrical device is having issues?", "What happens when you try to use it (e.g., sparks, doesn't turn on, trips breaker)?", "Have there been any recent electrical changes or installations?", "Is this an emergency (e.g., smoke, burning smell)?"\n- For 'Fan repair': "What type of fan is it (e.g., ceiling fan, exhaust fan, stand fan)?", "What is the specific issue (e.g., making noise, not spinning at all, spinning slowly)?", "Where is the fan located?", "When did the problem start?"\n\nAlways provide a 'refinedDescription' even if it's just a rephrase of the 'currentDescription' or an expanded version based on common sense for the service type.\n\nOutput must be a JSON object matching the 'CustomerJobDescriptionAssistantOutputSchema'.\n\nService Type: {{{serviceType}}}\nCurrent Description: {{{currentDescription}}}`,
});

// Define the flow
const customerJobDescriptionAssistantFlow = ai.defineFlow(
  {
    name: 'customerJobDescriptionAssistantFlow',
    inputSchema: CustomerJobDescriptionAssistantInputSchema,
    outputSchema: CustomerJobDescriptionAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await customerJobDescriptionAssistantPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a response from the AI assistant.');
    }
    return output;
  }
);
