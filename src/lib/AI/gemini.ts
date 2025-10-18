import { GoogleGenAI } from "@google/genai";

export async function passPromptToGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  if (!response.text) {
    throw new Error("Empty response from Gemini");
  }

  return response.text;
}