import { GoogleGenAI } from "@google/genai";
import { generalPrefix, sceneProcessPrefix } from "./prompts";
import { retrieveScenes } from "../rag";

const MODEL_CODE = "gemini-2.5-flash-lite";

async function passPromptToGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model: MODEL_CODE,
    contents: prompt,
  });

  if (!response.text) {
    throw new Error("Empty response from Gemini");
  }

  return response.text;
}

// we can come back to streaming later, it's just cosmetic really
async function* passPromptToGeminiStreaming(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const client = new GoogleGenAI({ apiKey });

  const stream = await client.models.generateContentStream({
    model: MODEL_CODE,
    contents: prompt,
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

export async function processGeneralPrompt(prompt: string) {
  const fullPrompt = generalPrefix + prompt;

  const reply = await passPromptToGemini(fullPrompt);

  return reply;
}

export async function processSceneRAGPrompt(prompt: string, ragRequest: string) {
  const {keywords} = JSON.parse(ragRequest);
  const scenes = retrieveScenes(keywords);

  const fullPrompt = `${sceneProcessPrefix} scene data: ${JSON.stringify(scenes)}` + `user prompt: ${prompt}`;
  const reply = await passPromptToGemini(fullPrompt);

  return reply;
}