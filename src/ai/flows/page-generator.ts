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
import { getSiteSettings } from '@/services/settingsService';

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
  input: {schema: GeneratePageContentInputSchema.extend({ schoolName: z.string() })},
  // The output from the prompt is just the initial HTML with placeholders
  output: {schema: z.object({ htmlContent: z.string() })},
  prompt: `You are an expert web designer and content creator for a school website called "{{{schoolName}}}".
Your task is to generate a complete, single-page HTML structure for the page body based on the title and topic provided. The design MUST be modern, visually engaging, and highly aesthetic, adhering strictly to the provided design system.

Instructions:
- School Name: {{{schoolName}}}
- Title: {{{title}}}
- Topic/Content Instructions: {{{topic}}}

**Design & Styling Mandates:**
1.  **HTML Structure**: Generate only the content for the \`<body>\`. The entire output must be wrapped in a single root \`<div>\`. Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags.
2.  **Color Palette (Strictly Enforced)**:
    *   Do NOT use hardcoded colors like \`text-gray-900\` or \`bg-blue-500\`.
    *   Use **thematic CSS classes ONLY**:
        *   For general text: \`text-foreground\`
        *   For subtitles, descriptions, or less important text: \`text-muted-foreground\`
        *   For primary action items, important titles, or highlighted elements: \`text-primary\`
        *   For backgrounds of main sections: \`bg-background\`
        *   For alternating/secondary section backgrounds: \`bg-muted\`
        *   For card backgrounds: \`bg-card\`
3.  **Layout & Effects**:
    *   **Hero Section:** Start with a strong hero section. Centered text, large title (\`text-4xl md:text-5xl font-extrabold\`), and a descriptive subtitle (\`text-lg text-muted-foreground\`).
    *   **Alternating Sections:** Alternate section backgrounds using \`bg-background\` and \`bg-muted\` to create visual separation. Use padding like \`py-20 px-4\`.
    *   **Dynamic Grids:** Use CSS Grid (\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\`) for feature lists or card sections.
    *   **Animations & Transitions:** Animate sections on load with \`animate-in fade-in slide-in-from-bottom-8 duration-500\`. Elements should have \`transition-all duration-300\`. Cards should have hover effects like \`hover:shadow-xl hover:-translate-y-2\`.
4.  **Typography & Readability (Strictly Enforced)**:
    *   **Headings:** Use appropriate heading levels (h2, h3). Section titles should be large and bold (e.g., \`text-3xl font-bold\`).
    *   **Main Paragraphs:** For main content areas, especially next to an image or in a single column, use a larger, more readable font size like \`text-lg\` and increase line spacing with \`leading-relaxed\`. The color MUST be \`text-muted-foreground\`.
    *   **Card Text:** For text inside smaller components like cards, use standard font sizes like \`text-base\` or \`text-sm\` for descriptions to avoid a cramped look. The color MUST be \`text-muted-foreground\`.
5.  **Component Design (Cards & CTAs):**
    *   **Feature Cards:** Design beautiful cards. Cards must be in \`bg-card\`, have \`rounded-2xl\`, and \`shadow-lg hover:shadow-primary/20\`.
    *   **Icon Usage:** For each feature card, you MUST select a relevant inline SVG icon that visually represents the card's topic. For instance, for a card about 'growth', use a plant icon; for 'collaboration', use a people icon. The icon MUST be wrapped in a colored circle for aesthetic emphasis, like so: \`<div class="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-6"><svg...></svg></div>\`.
    *   **Call to Action (CTA):** Include a visually distinct CTA section with a gradient background, like \`bg-gradient-to-br from-primary to-blue-700\`, with white text (\`text-primary-foreground\`) and a prominent button.
6.  **Image Integration**:
    *   You MUST use this exact placeholder format for all images: \`<img src="[AI_IMAGE_PLACEHOLDER]" alt="A highly descriptive alt text" class="w-full h-auto rounded-lg shadow-md aspect-video object-cover" data-ai-hint="a concise prompt for an image model max 5 words" />\`.
    *   \`data-ai-hint\` MUST be a very descriptive and visual prompt for an image generation model.
    *   Distribute images thoughtfully throughout the layout to break up text and create visual interest, often next to a block of text in a two-column layout.

Generate the full HTML content based on these advanced requirements. Make it look stunning and brand-consistent.`,
});


const generatePageContentFlow = ai.defineFlow(
  {
    name: 'generatePageContentFlow',
    inputSchema: GeneratePageContentInputSchema,
    outputSchema: GeneratePageContentOutputSchema,
  },
  async input => {
    const settings = await getSiteSettings();

    // 1. Generate HTML with image placeholders
    const llmResponse = await prompt({
        ...input,
        schoolName: settings.schoolName,
    });
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
