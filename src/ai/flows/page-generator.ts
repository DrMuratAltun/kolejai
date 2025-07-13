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
  prompt: `You are an expert web designer with a keen eye for clean, modern, and minimalist aesthetics. You will create a complete, single-page HTML body for a school website called "{{{schoolName}}}". The design must be professional, spacious, and strictly follow the provided design system.

Your output MUST be a single root \`<div>\`. Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags.

**Core Instructions:**
- School Name: {{{schoolName}}}
- Page Title: {{{title}}}
- Page Topic/Instructions: {{{topic}}}

---

**MANDATORY DESIGN SYSTEM & TYPOGRAPHY RULES:**

1.  **Color Palette (Strictly Enforced):**
    *   **NEVER** use hardcoded colors like \`text-gray-900\`, \`bg-blue-500\`, or any other Tailwind color classes directly.
    *   **ONLY USE SEMANTIC THEME CLASSES:**
        *   Main text: \`text-foreground\`
        *   Subtitles, descriptions, less important text: \`text-muted-foreground\`
        *   Main titles, highlighted elements: \`text-primary\`
        *   Main section backgrounds: \`bg-background\`
        *   Alternating/secondary section backgrounds: \`bg-muted\`
        *   Card backgrounds: \`bg-card\`

2.  **Typography & Readability (Strictly Enforced):**
    *   **Hero Title (h1):** Use \`text-4xl md:text-5xl font-bold text-primary\`.
    *   **Section Titles (h2):** Use \`text-3xl font-bold text-primary\`.
    *   **Card Titles (h3):** Use \`text-xl font-semibold text-primary\`.
    *   **Main Paragraphs:** In larger sections or next to images, use \`text-lg leading-relaxed text-muted-foreground\` for optimal readability.
    *   **Card/Component Paragraphs:** Inside cards or smaller components, use \`text-base text-muted-foreground\` to keep the design clean and uncluttered.

3.  **Layout & Spacing:**
    *   Use ample whitespace. Sections should have significant vertical padding, like \`py-20 px-4\` or \`py-24\`.
    *   Use CSS Grid for card layouts (\`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\`).
    *   Alternate section backgrounds using \`bg-background\` and \`bg-muted\` for visual separation.

---

**MANDATORY COMPONENT DESIGN:**

1.  **Feature Cards (The Most Important Rule):**
    *   Design clean, minimalist cards exactly like this example. This is not a suggestion, it is a strict requirement.
    *   **Structure:** A card must contain an icon, a title (h3), and a description (p).
    *   **Card Styling:** The container \`<div>\` must have \`bg-card p-8 rounded-xl shadow-md\`.
    *   **Icon Styling (Crucial):**
        *   The SVG icon MUST be simple and single-color. It MUST have the class \`text-primary\`.
        *   The icon MUST have a bottom margin, like \`mb-4\`.
        *   **DO NOT** wrap the icon in a colored circle or any other container. It must be just the SVG element.
    *   **Text Styling:** Follow the typography rules above (h3 for title, p for description).
    *   **Example of a PERFECT Card:**
        \`\`\`html
        <div class="bg-card p-8 rounded-xl shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 mb-4 text-primary">
            <path d="..."/>
          </svg>
          <h3 class="text-xl font-semibold text-primary mb-2">Card Title</h3>
          <p class="text-base text-muted-foreground">This is the description text for the card.</p>
        </div>
        \`\`\`

2.  **Image Integration:**
    *   Use this exact placeholder format: \`<img src="[AI_IMAGE_PLACEHOLDER]" alt="A descriptive alt text" class="w-full h-auto rounded-lg shadow-md aspect-video object-cover" data-ai-hint="a concise prompt for an image model max 5 words" />\`.
    *   \`data-ai-hint\` MUST be a descriptive, visual prompt for an image generation model.

3.  **Call to Action (CTA) Section:**
    *   The final section should be a CTA.
    *   It should have a clean background, like \`bg-muted\`.
    *   Include a strong headline (\`h2\`) and a descriptive paragraph (\`p\`).
    *   The button must be prominent. Use a button tag: \`<a href="/contact" class="inline-block bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">Kayıt Ol</a>\`.

Now, generate the full, beautiful, and brand-consistent HTML body based on these strict instructions.
`,
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
