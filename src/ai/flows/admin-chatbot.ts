// src/ai/flows/admin-chatbot.ts
'use server';
/**
 * @fileOverview Admin chatbot flow for answering questions and generating content suggestions.
 *
 * - adminChatbot - A function that handles the admin chatbot interactions.
 * - AdminChatbotInput - The input type for the adminChatbot function.
 * - AdminChatbotOutput - The return type for the adminChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminChatbotInputSchema = z.object({
  query: z.string().describe('The query from the admin user.'),
});
export type AdminChatbotInput = z.infer<typeof AdminChatbotInputSchema>;

const AdminChatbotOutputSchema = z.object({
  response: z.string().describe('The response from the chatbot.'),
});
export type AdminChatbotOutput = z.infer<typeof AdminChatbotOutputSchema>;

export async function adminChatbot(input: AdminChatbotInput): Promise<AdminChatbotOutput> {
  return adminChatbotFlow(input);
}

const adminChatbotPrompt = ai.definePrompt({
  name: 'adminChatbotPrompt',
  input: {schema: AdminChatbotInputSchema},
  output: {schema: AdminChatbotOutputSchema},
  prompt: `You are an AI assistant helping the admin user to manage the website.

  Answer the following question:
  {{query}}
  `,
});

const adminChatbotFlow = ai.defineFlow(
  {
    name: 'adminChatbotFlow',
    inputSchema: AdminChatbotInputSchema,
    outputSchema: AdminChatbotOutputSchema,
  },
  async input => {
    const {output} = await adminChatbotPrompt(input);
    return output!;
  }
);
