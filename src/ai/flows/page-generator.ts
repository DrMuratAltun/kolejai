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
import { getSiteSettings, type SiteSettingsData } from '@/services/settingsService';

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
  input: {schema: GeneratePageContentInputSchema.extend({ settings: z.custom<SiteSettingsData>() })},
  // The output from the prompt is just the initial HTML with placeholders
  output: {schema: z.object({ htmlContent: z.string() })},
  prompt: `You are an expert web designer with a keen eye for modern, vibrant, and engaging aesthetics. You will create a complete, single-page HTML body for a school website called "{{{settings.schoolName}}}". The design must be professional, spacious, and strictly follow the provided design system.

Your output MUST be a single root \`<div>\`. Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags.

**Core Instructions:**
- School Name: {{{settings.schoolName}}}
- School Address: {{{settings.address}}}
- School Phone: {{{settings.phone}}}
- School Email: {{{settings.email}}}
- Page Title: {{{title}}}
- Page Topic/Instructions: {{{topic}}}

---

**MANDATORY DESIGN SYSTEM & STRUCTURE:**

1.  **Content Sectioning & Layout Variation (Crucial):**
    *   You MUST analyze the provided topic and divide it into logical, self-contained \`<section>\` blocks.
    *   Each section MUST have a clear title (e.g., \`<h2 class="text-3xl font-bold text-primary mb-8">\`).
    *   **Vary the layout!** Choose the most appropriate layout for the content of each section.
        *   **For featuring a single person or a detailed concept:** Use a two-column layout: \`<div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">\`, placing text on one side and an image on the other. Alternate the order (image left, then image right) in subsequent sections to create visual interest.
        *   **For listing a group of people (e.g., a board of directors, alumni):** Use a grid of "Profile Cards". Example: \`<div class="grid grid-cols-1 md:grid-cols-3 gap-8">\`.
        *   **For listing features or services:** Use a grid of "Feature Cards".
        *   **For general text:** Use a full-width section with a title and enhanced paragraphs.

2.  **Visual Rhythm (Backgrounds):**
    *   You MUST alternate the background color of each \`<section>\` block between \`bg-background\` and \`bg-muted\` to create a visually appealing rhythm. For example: \`<section class="py-20 px-4 bg-background">\`, then \`<section class="py-20 px-4 bg-muted">\`, and so on.

3.  **Color Palette (Strictly Enforced):**
    *   **NEVER** use hardcoded colors like \`text-gray-900\`, \`bg-blue-500\`, etc.
    *   **ONLY USE SEMANTIC THEME CLASSES:**
        *   Main text: \`text-foreground\`
        *   Subtitles, descriptions: \`text-muted-foreground\`
        *   Main titles, highlighted elements: \`text-primary\`

4.  **Rich Typography & Readability (Strictly Enforced):**
    *   **Page Title (h1):** Use \`text-4xl md:text-5xl font-extrabold text-primary\`.
    *   **Section Titles (h2):** Use \`text-3xl font-bold text-primary\`.
    *   **Main Paragraphs:** Use \`text-lg leading-relaxed text-muted-foreground\` for optimal readability.
    *   **Text Enrichment:** Do not just use plain paragraphs. You MUST enhance the content's visual appeal and readability by using:
        *   **Lists (\`<ul>\`):** For bullet points, use classes like \`list-disc pl-6 space-y-2 text-lg text-muted-foreground\`.
        *   **Quotes (\`<blockquote>\`):** To highlight key statements, use classes like \`border-l-4 border-primary pl-4 italic text-muted-foreground\`.
        *   **Emphasis (\`<strong>\`):** Use bold text to emphasize important keywords within paragraphs.

5.  **Spacing:**
    *   Use ample whitespace. Sections should have significant vertical padding, like \`py-20 px-4\` or \`py-24\`.
    
6.  **Animations:**
    *   Animate sections into view subtly: \`<section class="py-20 px-4 bg-muted animate-in fade-in slide-in-from-bottom-8 duration-500">\`.

---

**MANDATORY COMPONENT DESIGN:**

You MUST choose the most appropriate card type based on the context. If listing features, services, or abstract concepts, use "Feature Cards". If listing people, alumni, or items with a primary photo, use "Profile Cards".

1.  **Feature Cards (For listing features, services, or abstract concepts):**
    *   Design vibrant, colorful, modern cards exactly like this example. This is a strict requirement.
    *   **Structure:** A card must contain a large icon, a title (h3), and a description (p).
    *   **Card Styling:** The container \`<div>\` must have \`p-8 rounded-2xl text-white flex flex-col items-center text-center shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl\`.
    *   **Card Colors (Crucial):**
        *   You MUST use one of the predefined feature colors for the background of each card. Use classes like \`bg-[hsl(var(--feature-1))]\`, \`bg-[hsl(var(--feature-2))]\`, etc.
        *   Cycle through the available feature colors (\`feature-1\` to \`feature-6\`).
    *   **Icon Styling (Crucial):**
        *   The SVG icon MUST be large and single-color white. It MUST have the class \`w-16 h-16 mb-6\`.
        *   **The icon's shape MUST be semantically relevant to the card's topic.** You must analyze the card's title and text to choose a directly related icon.
        *   **Examples of good, relevant icons:**
            *   For a card about "**Swimming Success**", a relevant icon would be a swimmer: \`<path d="M19 19l-4-4-1 3-3-1-4 4"/> ...etc.\`
            *   For a card about "**Music Education**", a relevant icon would be a musical note: \`<path d="M9 18V5l12-2v13"/> ...etc.\`
            *   For a card about "**Science Fair**", a relevant icon would be a beaker or flask: \`<path d="M8.5 2.5a2.5 2.5 0 0 1 5 0V3h-5V2.5Z"/> ...etc.\`
    *   **Example of a PERFECT Feature Card:**
        \`\`\`html
        <div class="p-8 rounded-2xl text-white flex flex-col items-center text-center shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl" style="background-color: hsl(var(--feature-1));">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16 mb-6">
                <!-- A semantically relevant path, like a swimmer for a swimming topic -->
                <path d="M19 19l-4-4-1 3-3-1-4 4"/>
                <path d="m10 8-1-1-2 2-1-1-2 2"/>
                <circle cx="12" cy="5" r="1"/>
            </svg>
            <h3 class="text-xl font-bold mb-3">Swimming Success</h3>
            <p class="text-sm opacity-90">Our students won the regional swimming championship.</p>
        </div>
        \`\`\`

2.  **Profile Cards (For listing people, alumni, or specific items with photos):**
    *   Design interactive, two-state hover cards exactly like this example. Do NOT use 3D flip effects.
    *   **Main Container:** The container must be a Card component: \`<div class="rounded-xl overflow-hidden shadow-lg group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20">\`.
    *   **Image Container:** Inside, there must be a relative-positioned div for the image: \`<div class="relative aspect-square">\`.
    *   **Image:** The \`<img>\` tag must have \`object-cover transition-transform duration-300 group-hover:scale-105\` classes.
    *   **Hover Overlay:** You MUST add two overlay divs inside the image container for the hover effect.
        *   **Gradient Overlay:** \`<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>\`
        *   **Text Overlay:** \`<div class="absolute inset-0 p-6 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">...\` This div will contain the person's biography.
    *   **Bottom Content Area:** Below the image container, there must be a \`<div>\` with \`p-4 bg-card\` classes. This area contains the person's name and title.
    *   **Example of a PERFECT Profile Card:**
        \`\`\`html
        <div class="rounded-xl overflow-hidden shadow-lg group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20">
          <div class="relative aspect-square">
            <img src="[AI_IMAGE_PLACEHOLDER]" alt="Descriptive alt text" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="portrait of a person" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute inset-0 p-6 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p class="text-sm line-clamp-4 mb-4">A brief bio about the person goes here. It should be concise and informative.</p>
              <div class="flex space-x-3">
                  <!-- Optional Social Links Here -->
              </div>
            </div>
          </div>
          <div class="p-4 bg-card">
            <h3 class="text-lg font-semibold text-foreground">Person's Name</h3>
            <p class="text-sm text-muted-foreground">Person's Title</p>
          </div>
        </div>
        \`\`\`

3.  **Image Integration:**
    *   Use this exact placeholder format: \`<img src="[AI_IMAGE_PLACEHOLDER]" alt="A descriptive alt text" class="..." data-ai-hint="a concise prompt for an image model max 5 words" />\`.
    *   \`data-ai-hint\` MUST be a descriptive, visual prompt for an image generation model.

4.  **Call to Action (CTA) Section:**
    *   The final section should be a CTA. It should have a clean background, like \`bg-muted\`.
    *   Include a strong headline (\`h2\`) and a descriptive paragraph (\`p\`).
    *   The button MUST be prominent and **MUST link to the real contact page**: \`<a href="/contact" class="inline-block bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">Kayıt Ol</a>\`. Do NOT use placeholder hrefs like "#".

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
        settings: settings,
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
