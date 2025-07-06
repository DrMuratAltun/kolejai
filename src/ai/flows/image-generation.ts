'use server';
/**
 * @fileOverview AI flow for generating images from a text prompt.
 * - generateImage: Generates an image based on a prompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt }) => {
    // Step 1: Use a text model to convert the user's content into a purely descriptive prompt for the image model.
    // This helps prevent the image model from trying to render text from the original prompt.
    const descriptivePromptResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `Based on the following news headline/content, create a short, visually descriptive prompt for an image generation model. The prompt should describe a scene or concept related to the text, but it MUST NOT contain any of the original words, letters, or direct quotes.

      Example Input: "Okulumuzun öğrencileri bilim fuarında roket projesiyle birincilik ödülü kazandı."
      Example Output: "Students celebrating with a trophy next to a model rocket at a science fair."

      Original Text: "${prompt}"

      Descriptive Image Prompt:`,
       config: {
        temperature: 0.4,
      }
    });

    const descriptivePrompt = descriptivePromptResponse.text;
    
    // Step 2: Generate the image using the new, clean, descriptive prompt.
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A high quality, photorealistic image of: ${descriptivePrompt}. The image must not contain any text, writing, or letters. Cinematic lighting. Wide-angle shot, aspect ratio 16:9.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error("Image generation failed.");
    }

    return { imageUrl: media.url };
  }
);
