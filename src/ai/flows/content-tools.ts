// src/ai/flows/content-tools.ts
'use server';
/**
 * @fileOverview AI flows for content generation and manipulation.
 * - rewriteText: Rewrites a given text based on instructions.
 * - generateText: Generates text based on a given topic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Rewrite Text Flow
const RewriteTextInputSchema = z.object({
  text: z.string().describe('The original text to rewrite.'),
  instruction: z.string().describe('The instruction on how to rewrite the text (e.g., "make it shorter", "make it more formal").'),
});
export type RewriteTextInput = z.infer<typeof RewriteTextInputSchema>;

const RewriteTextOutputSchema = z.object({
  rewrittenText: z.string().describe('The rewritten text.'),
});
export type RewriteTextOutput = z.infer<typeof RewriteTextOutputSchema>;

export async function rewriteText(input: RewriteTextInput): Promise<RewriteTextOutput> {
  return rewriteTextFlow(input);
}

const rewriteTextPrompt = ai.definePrompt({
  name: 'rewriteTextPrompt',
  input: {schema: RewriteTextInputSchema},
  output: {schema: RewriteTextOutputSchema},
  prompt: `You are a content editor. Rewrite the following text based on the user's instruction.
  
  Instruction: {{{instruction}}}
  
  Text to rewrite:
  """
  {{{text}}}
  """
  
  Provide only the rewritten text in your response.`,
});

const rewriteTextFlow = ai.defineFlow(
  {
    name: 'rewriteTextFlow',
    inputSchema: RewriteTextInputSchema,
    outputSchema: RewriteTextOutputSchema,
  },
  async input => {
    const {output} = await rewriteTextPrompt(input);
    return output!;
  }
);

// Generate Text Flow
const GenerateTextInputSchema = z.object({
  topic: z.string().describe('The topic or prompt for text generation.'),
});
export type GenerateTextInput = z.infer<typeof GenerateTextInputSchema>;

const GenerateTextOutputSchema = z.object({
  generatedText: z.string().describe('The generated text.'),
});
export type GenerateTextOutput = z.infer<typeof GenerateTextOutputSchema>;

export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
  return generateTextFlow(input);
}

const generateTextPrompt = ai.definePrompt({
  name: 'generateTextPrompt',
  input: {schema: GenerateTextInputSchema},
  output: {schema: GenerateTextOutputSchema},
  prompt: `You are a content writer. Write a piece of text about the following topic.
  
  Topic: {{{topic}}}
  
  Provide only the generated text in your response.`,
});

const generateTextFlow = ai.defineFlow(
  {
    name: 'generateTextFlow',
    inputSchema: GenerateTextInputSchema,
    outputSchema: GenerateTextOutputSchema,
  },
  async input => {
    const {output} = await generateTextPrompt(input);
    return output!;
  }
);
