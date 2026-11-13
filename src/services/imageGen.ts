import { GoogleGenAI } from '@google/genai';
import { AspectRatioOption } from '../types';

export interface GeneratedSolarAsset {
  id: string;
  prompt: string;
  aspectRatio: AspectRatioOption;
  model: string;
  imageUrl: string;
  timestamp: string;
  title: string;
}

export class ImageGenService {
  /**
   * Generates a solar marketing asset using the Gemini API without static fallback images.
   */
  static async generateSolarImage(
    prompt: string,
    aspectRatio: AspectRatioOption,
    model: 'gemini-nano-banana-2.1' | 'gemini-3-pro-image-preview' = 'gemini-nano-banana-2.1',
    apiKey?: string
  ): Promise<GeneratedSolarAsset> {
    const key = apiKey || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';

    if (!key) {
      throw new Error('GEMINI_API_KEY is required for live image generation.');
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model,
      contents: `High resolution commercial marketing photography for Shantis Designs Solar Solutions Kenya: ${prompt}. Aspect ratio ${aspectRatio}. Professional lighting, crisp solar panels, clean modern Kenyan home or commercial rooftop.`,
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return {
            id: 'gen-' + Date.now(),
            prompt,
            aspectRatio,
            model,
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            timestamp: new Date().toLocaleTimeString(),
            title: prompt.slice(0, 30),
          };
        }
      }
    }

    throw new Error('No image data returned from Gemini API.');
  }
}
