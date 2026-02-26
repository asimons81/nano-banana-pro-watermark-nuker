import { GoogleGenAI } from "@google/genai";

// Initialize the client
// API Key is strictly from process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Removes watermarks from an image using the Gemini 2.5 Flash Image model.
 * 
 * @param base64Image The base64 encoded string of the image (without the data prefix).
 * @param mimeType The MIME type of the image.
 * @param instructions Optional user instructions for specific watermark locations.
 * @returns The base64 data of the processed image.
 */
export const removeWatermarkFromImage = async (
  base64Image: string,
  mimeType: string,
  instructions?: string
): Promise<string> => {
  try {
    // Model selection: gemini-2.5-flash-image is the standard/free tier efficient image model.
    // It supports image editing via text prompts.
    const model = 'gemini-2.5-flash-image';

    let prompt = "You are a professional photo editor. Your sole task is to remove the watermark from this image. ";
    prompt += "1. Identify the watermark: Look for semi-transparent logos, copyright text, URL addresses, or branding stamps. These are often in the corners (especially the bottom-right) or repeated patterns. ";
    prompt += "2. Remove the watermark: Erase only these branding elements. ";
    prompt += "3. PRESERVE CONTENT: Do NOT remove standard text, captions, speech bubbles, street signs, or any text that is part of the subject matter. Only remove the foreign branding layer. ";
    prompt += "4. Inpaint: Fill the erased area to seamlessly match the background texture.";

    if (instructions && instructions.trim().length > 0) {
      prompt += `\n\nSpecific user requirement: ${instructions}`;
    }

    prompt += "\n\nReturn only the processed image.";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract the image from the response
    // The response might contain text or other parts, we need to find the inlineData
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image data received from the model.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};