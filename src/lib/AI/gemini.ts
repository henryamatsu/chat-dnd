import { GoogleGenAI } from "@google/genai";
import { findRecentMessages } from "../controllers/messageController";
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
  const fullPrompt = `${addGeneralInstruction()}
  ${addSceneFetchInstruction()}
  ${await addRecentMessages()}
  ${addCurrentPrompt(prompt)}`;

  const reply = await passPromptToGemini(fullPrompt);
  return reply;
}

export async function processSceneRAGPrompt(
  prompt: string,
  ragRequest: string
) {
  const fullPrompt = `${addGeneralInstruction()}
  ${await addRecentMessages()}
  ${await addPastScenes(ragRequest)}
  ${addPostRAGInstruction()}
  ${addCurrentPrompt(prompt)}`;

  const reply = await passPromptToGemini(fullPrompt);
  return reply;
}

function addGeneralInstruction() {
  const promptSegment = `You are the game master for a ttrpg.`;
  return promptSegment;
}

function addCurrentPrompt(prompt: string) {
  const promptSegment = `Current Prompt: ${prompt}`;
  return promptSegment;
}

async function addRecentMessages() {
  const recentMessages = await findRecentMessages();
  let promptSegment = "";

  if (recentMessages.length > 0) {
    const simpleMessages = recentMessages
      .map((message) => `${message.role}: ${message.text}`)
      .join("\n");
    promptSegment = `${"Recent Messages: " + simpleMessages}`;
  }

  return promptSegment;
}

async function addPastScenes(ragRequest: string) {
  const { keywords, reasoning } = JSON.parse(ragRequest);
  const scenes = retrieveScenes(keywords);
  // console.log(`Prompt: ${prompt}\n\n Reasoning: ${reasoning}\n\n`);
  // ${JSON.stringify(scenes)} replace dummy scene with this
  const fullPrompt = `Past Scenes: {number: 1, text: "The hero Jethro is in a cave infested with goblins", keywords: ["cave", "goblin"]}`;

  return fullPrompt;
}

function addSceneFetchInstruction() {
  const promptSegment = `Referecing Past Scenes: If the user asks about events or story details not covered by recent messages or recent scenes, you should respond purely with JSON to request system info:

{"keywords": [], "reasoning": string}

You should extract keywords from the user's prompt, and put them in the keywords array. All keywords should be singular.
If you are requesting system info, you should include nothing else in your message except for this JSON. Do not wrap your response in markdown.`;

  return promptSegment;
}

function addPostRAGInstruction() {
  const promptSegment = `Inventing Details: If the user asks events or story details not covered by recent messages, recent scenes or past scenes, you should do the following:
1. if the player is asking about the current scene, invent details
2. If the player is asking about past events, say you don't know`;

  return promptSegment;
}

function addActionDifficultyInstruction() {}
