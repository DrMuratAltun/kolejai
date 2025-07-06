// src/ai/flows/page-generator.ts
'use server';
/**
 * @fileOverview AI flow for generating full HTML page content, including AI-generated images.
 * - generatePageContent: Generates a complete, styled HTML page body based on a topic and title.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateImage } from './image-generation';
import { uploadFile, dataURLtoFile } from '@/lib/firebase-storage';
import { v4 as uuidv4 } from 'uuid';

const GeneratePageContentInputSchema = z.object({
  title: z.string().describe('The main title of the web page.'),
  topic: z.string().describe('A detailed description or topic for the page content.'),
});
export type GeneratePageContentInput = z.infer<typeof GeneratePageContentInputSchema>;

const GeneratePageContentOutputSchema = z.object({
  htmlContent: z.string().describe('The full HTML body of the generated page, styled with Tailwind CSS and including image URLs.'),
});
export type GeneratePageContentOutput = z.infer<typeof GeneratePageContentOutputSchema>;

export async function generatePageContent(input: GeneratePageContentInput): Promise<GeneratePageContentOutput> {
  return generatePageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePageContentPrompt',
  input: {schema: GeneratePageContentInputSchema},
  // The output from the prompt is just the initial HTML with placeholders
  output: {schema: z.object({ htmlContent: z.string() })},
  prompt: `You are an expert web designer and content creator for a school website called "Bilge Yıldız Koleji". 
  
  Your task is to generate a complete, single-page HTML structure for the page body based on the title and topic provided.

  Instructions:
  - Title: {{{title}}}
  - Topic/Content Instructions: {{{topic}}}
  
  Requirements:
  1.  **HTML Structure**: Generate only the content that would go inside the <body> tag. Wrap the entire output in a single root \`<div>\` element with appropriate padding (e.g., 'p-4 md:p-8'). Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags.
  2.  **Styling**: Use Tailwind CSS classes for all styling. The design must be modern, clean, professional, and visually appealing, consistent with a school's aesthetic.
      - Use section-based layouts. Alternate background colors for sections using 'bg-background' and 'bg-muted' for a dynamic feel.
      - Create visually interesting components like cards with hover effects (e.g., 'hover:shadow-lg', 'hover:-translate-y-1', 'transition-all', 'duration-300').
      - Use a responsive grid system ('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-8').
  3.  **Content**: The generated content should be well-written, professional, and relevant to the provided title and topic.
  4.  **Images**: For any image, you MUST use the following special placeholder format: \`<img src="[AI_IMAGE_PLACEHOLDER]" alt="A descriptive alt text" class="w-full h-auto rounded-lg shadow-md" data-ai-hint="a concise, descriptive prompt for an image generation model, max 5 words" />\`. DO NOT use any other src. Provide a highly descriptive \`data-ai-hint\`.
  
  Example of a good root element: \`<div class="container mx-auto px-4 py-12 animate-in fade-in duration-500 space-y-16">\`
  Example of a feature card:
  \`\`\`html
  <div class="bg-card p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
    <h3 class="text-xl font-bold mb-2 text-primary">Akademik Mükemmellik</h3>
    <p class="text-muted-foreground">Öğrencilerimizi en son müfredat ve yenilikçi öğretim metodlarıyla geleceğe hazırlıyoruz.</p>
  </div>
  \`\`\`
  Generate the HTML content for the page.`,
});


const generatePageContentFlow = ai.defineFlow(
  {
    name: 'generatePageContentFlow',
    inputSchema: GeneratePageContentInputSchema,
    outputSchema: GeneratePageContentOutputSchema,
  },
  async input => {
    // 1. Generate HTML with image placeholders
    const llmResponse = await prompt(input);
    let htmlContent = llmResponse.output?.htmlContent || '';

    // 2. Find all image hints
    const imgTagRegex = /<img[^>]+data-ai-hint="([^"]+)"[^>]*>/g;
    const hints = [...htmlContent.matchAll(imgTagRegex)].map(match => match[1]);

    if (hints.length === 0) {
      return { htmlContent };
    }

    // 3. Generate images in parallel
    const imageGenPromises = hints.map(hint => generateImage({ prompt: hint }));
    const generatedImages = await Promise.all(imageGenPromises);

    // 4. Upload images to Firebase Storage in parallel
    const uploadPromises = generatedImages.map(imgResult => {
      if (imgResult.imageUrl) {
        const filename = `${uuidv4()}.png`;
        const file = dataURLtoFile(imgResult.imageUrl, filename);
        return uploadFile(file, 'pages');
      }
      return Promise.resolve(null);
    });

    const imageUrls = await Promise.all(uploadPromises);

    // 5. Replace placeholders with actual URLs
    let urlIndex = 0;
    htmlContent = htmlContent.replace(/src="\[AI_IMAGE_PLACEHOLDER\]"/g, () => {
        const url = imageUrls[urlIndex];
        urlIndex++;
        return url ? `src="${url}"` : `src="https://placehold.co/600x400.png"`; // Fallback
    });

    return { htmlContent };
  }
);
