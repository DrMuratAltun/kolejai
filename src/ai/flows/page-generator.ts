// src/ai/flows/page-generator.ts
'use server';
/**
 * @fileOverview AI flow for generating full HTML page content, including AI-generated images.
 * - generatePageContent: Generates a complete, styled HTML page body based on a topic and title.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateImage } from './image-generation';
import { uploadFile } from '@/lib/firebase-storage';
import { dataURLtoFile } from '@/lib/utils';
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
Your task is to generate a complete, single-page HTML structure for the page body based on the title and topic provided. The design MUST be modern, visually engaging, and highly aesthetic.

Instructions:
- Title: {{{title}}}
- Topic/Content Instructions: {{{topic}}}

**Design & Styling Mandates:**
1.  **HTML Structure**: Generate only the content for the \`<body>\`. The entire output must be wrapped in a single root \`<div>\`. Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags. The root element should have nice padding, like \`<div class="container mx-auto px-4 py-16 md:py-24 space-y-20 animate-in fade-in duration-700">\`.
2.  **Layout & Effects**:
    *   **Dynamic Layouts:** Create distinct sections. Use a mix of centered content, two-column grids, and three-column card grids.
    *   **Backgrounds:** Alternate section backgrounds using \`bg-background\` and \`bg-muted\`. For a hero section or CTA, consider a subtle gradient background like \`bg-gradient-to-br from-primary/10 to-background\`.
    *   **Animations & Transitions:** Use Tailwind classes for smooth user interaction. Elements should have \`transition-all duration-300\`. Cards should have hover effects like \`hover:shadow-xl hover:-translate-y-2\`. Animate sections on load with \`animate-in fade-in slide-in-from-bottom-8 duration-500\`.
3.  **Component Design (Cards):**
    *   Design beautiful cards. Cards should be in \`bg-card\`, have \`rounded-xl\`, and \`shadow-lg\`.
    *   An example of a more advanced feature card:
        \`\`\`html
        <div class="bg-card p-8 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2">
          <div class="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v11.494m-5.747-5.747H17.747" /></svg>
          </div>
          <h3 class="text-2xl font-bold mb-3 text-card-foreground">Modern Curriculum</h3>
          <p class="text-muted-foreground">We utilize the latest pedagogical methods to prepare students for the future.</p>
        </div>
        \`\`\`
4.  **Content**: Ensure generated text is professional, well-written, and directly addresses the provided topic and title.
5.  **Image Integration**:
    *   You MUST use this exact placeholder format for all images: \`<img src="[AI_IMAGE_PLACEHOLDER]" alt="A highly descriptive alt text" class="w-full h-auto rounded-lg shadow-md aspect-video object-cover" data-ai-hint="a concise prompt for an image model max 5 words" />\`.
    *   \`data-ai-hint\` MUST be a very descriptive and visual prompt for an image generation model.
    *   Distribute images thoughtfully throughout the layout to break up text and create visual interest.

Generate the full HTML content based on these advanced requirements.`,
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
