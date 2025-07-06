// src/ai/flows/page-generator.ts
'use server';
/**
 * @fileOverview AI flow for generating full HTML page content.
 * - generatePageContent: Generates a complete, styled HTML page body based on a topic and title.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePageContentInputSchema = z.object({
  title: z.string().describe('The main title of the web page.'),
  topic: z.string().describe('A detailed description or topic for the page content.'),
});
export type GeneratePageContentInput = z.infer<typeof GeneratePageContentInputSchema>;

const GeneratePageContentOutputSchema = z.object({
  htmlContent: z.string().describe('The full HTML body of the generated page, styled with Tailwind CSS.'),
});
export type GeneratePageContentOutput = z.infer<typeof GeneratePageContentOutputSchema>;

export async function generatePageContent(input: GeneratePageContentInput): Promise<GeneratePageContentOutput> {
  return generatePageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePageContentPrompt',
  input: {schema: GeneratePageContentInputSchema},
  output: {schema: GeneratePageContentOutputSchema},
  prompt: `You are an expert web designer and content creator for a school website called "Bilge Yıldız Koleji". 
  
  Your task is to generate a complete, single-page HTML structure for the page body based on the title and topic provided.

  Instructions:
  - Title: {{{title}}}
  - Topic/Content Instructions: {{{topic}}}
  
  Requirements:
  1.  **HTML Structure**: Generate only the content that would go inside the <body> tag. Wrap the entire output in a single root \`<div>\` element with appropriate padding (e.g., 'p-4 md:p-8'). Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags.
  2.  **Styling**: Use Tailwind CSS classes for all styling. The design must be modern, clean, professional, and visually appealing, consistent with a school's aesthetic (use blues, whites, and gentle accent colors). Use classes like 'text-3xl', 'font-bold', 'text-primary', 'bg-muted', 'rounded-lg', 'shadow-md', 'grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-8', etc.
  3.  **Content**: The generated content should be well-written, professional, and relevant to the provided title and topic.
  4.  **Images**: Use placeholder images from \`https://placehold.co/<width>x<height>.png\`. Ensure the placeholders are appropriately sized for their context (e.g., \`https://placehold.co/800x600.png\`). Add a relevant \`data-ai-hint\` attribute to each image tag (e.g., \`data-ai-hint="students studying"\`).
  5.  **Components**: Create sections. For example, a hero section with a title, text blocks, card layouts for features, etc. Make the layout interesting and engaging.
  
  Example of a good root element: \`<div class="container mx-auto px-4 py-12 animate-in fade-in duration-500">\`
  
  Generate the HTML content for the page.`,
});

const generatePageContentFlow = ai.defineFlow(
  {
    name: 'generatePageContentFlow',
    inputSchema: GeneratePageContentInputSchema,
    outputSchema: GeneratePageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
