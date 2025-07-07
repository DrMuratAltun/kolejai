'use server';

/**
 * @fileOverview Implements a RAG-based chatbot for website visitors.
 *
 * - visitorChatbot - A function that handles chatbot interactions.
 * - VisitorChatbotInput - The input type for the visitorChatbot function.
 * - VisitorChatbotOutput - The return type for the visitorChatbot function.
 */

import {ai} from '@/ai/genkit';
import { getSiteSettings } from '@/services/settingsService';
import {z} from 'genkit';

const VisitorChatbotInputSchema = z.object({
  query: z.string().describe('The user query to the chatbot.'),
});
export type VisitorChatbotInput = z.infer<typeof VisitorChatbotInputSchema>;

const VisitorChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});
export type VisitorChatbotOutput = z.infer<typeof VisitorChatbotOutputSchema>;

export async function visitorChatbot(input: VisitorChatbotInput): Promise<VisitorChatbotOutput> {
  return visitorChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visitorChatbotPrompt',
  input: {schema: VisitorChatbotInputSchema.extend({ schoolName: z.string() })},
  output: {schema: VisitorChatbotOutputSchema},
  prompt: `You are a chatbot for {{{schoolName}}}, an educational institution. Answer user questions based on your knowledge of the school.

Query: {{{query}}}
`,
});

const visitorChatbotFlow = ai.defineFlow(
  {
    name: 'visitorChatbotFlow',
    inputSchema: VisitorChatbotInputSchema,
    outputSchema: VisitorChatbotOutputSchema,
  },
  async input => {
    const settings = await getSiteSettings();
    const {output} = await prompt({
        ...input,
        schoolName: settings.schoolName,
    });
    return output!;
  }
);
