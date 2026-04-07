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

// Define the prompt
const customerJobDescriptionAssistantPrompt = ai.definePrompt({
  name: 'customerJobDescriptionAssistantPrompt',
  input: { schema: CustomerJobDescriptionAssistantInputSchema },
  output: { schema: CustomerJobDescriptionAssistantOutputSchema },
  system: `You are a helpful AI assistant specialized in home service work. Your primary goal is to assist customers in creating clear, detailed, and unambiguous job descriptions for service workers.
  
Analyze the user's input for the specific service type. 
1. If the description is vague, provide a polished 'refinedDescription' based on what is provided and generate 'clarifyingQuestionsOrSuggestions' to help the customer provide better details.
2. If the description is already detailed, provide a professional version and set 'isSufficient' to true.
3. Always respond in the requested JSON format.`,
  prompt: `Service Type: {{serviceType}}
Current Description: {{currentDescription}}`,
});

// Define the flow
const customerJobDescriptionAssistantFlow = ai.defineFlow(
  {
    name: 'customerJobDescriptionAssistantFlow',
    inputSchema: CustomerJobDescriptionAssistantInputSchema,
    outputSchema: CustomerJobDescriptionAssistantOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await customerJobDescriptionAssistantPrompt(input);
      if (!output) {
        throw new Error('The AI assistant could not generate a valid response.');
      }
      return output;
    } catch (error: any) {
      console.error('Genkit Flow Error:', error);
      throw new Error(error.message || 'An unexpected error occurred in the AI flow.');
    }
  }
);

// Wrapper function to call the flow
export async function customerJobDescriptionAssistant(
  input: CustomerJobDescriptionAssistantInput
): Promise<CustomerJobDescriptionAssistantOutput> {
  return customerJobDescriptionAssistantFlow(input);
}
