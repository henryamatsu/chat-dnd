import { GoogleGenAI } from "@google/genai";
import {
  getMessageCount,
  findRecentMessages,
} from "../controllers/messageController";
import { retrieveScenes } from "../rag";
import { findRecentScenes } from "../controllers/sceneController";

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
  ${await addRecentScenes()}
  ${await addRecentMessages()}
  ${addCurrentPrompt(prompt)}`;

  const reply = await passPromptToGemini(fullPrompt);
  return reply;
}

export async function processSceneRAGPrompt(
  prompt: string,
  ragRequest: string
) {
  console.log("performing scene lookup");

  const fullPrompt = `${addGeneralInstruction()}
  ${await addRecentScenes()}
  ${await addRecentMessages()}
  ${await addPastScenes(ragRequest)}
  ${addPostRAGInstruction()}
  ${addCurrentPrompt(prompt)}`;

  const reply = await passPromptToGemini(fullPrompt);
  return reply;
}

export async function processMessagesIntoScene() {
  const totalMessageCount = await getMessageCount();

  const messageThreshold = 10;

  if (totalMessageCount % messageThreshold === 0) {
    const fullPrompt = `you should respond purely with JSON representing a summary of the following messages:

{"keywords": [], "text": string}

The text property should by a 3-4 summary. You should extract keywords from the summary and put them in the keywords array. All keywords should be singular.
You should include nothing else in your message except for valid JSON. Do not wrap the JSON in markdown codeblocks and do not use \` symbols.
${await addRecentMessages()}
`;

    const scene = await passPromptToGemini(fullPrompt);
    return JSON.parse(scene);
  }

  return null;
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

async function addRecentScenes() {
  const recentScenes = await findRecentScenes();
  let promptSegment = "";

  if (recentScenes.length > 0) {
    const simpleScenes = recentScenes
      .map((scene) => `${scene.text}`)
      .join("\n");
    promptSegment = `${"Recent Scenes: " + simpleScenes}`;
  }

  return promptSegment;
}

async function addPastScenes(ragRequest: string) {
  const { keywords } = JSON.parse(ragRequest);
  const scenes = retrieveScenes(keywords);

  const fullPrompt = `Past Scenes: ${JSON.stringify(scenes)}`;
  return fullPrompt;
}

function addSceneFetchInstruction() {
  const promptSegment = `Referecing Past Scenes: If the user asks about events or story details not covered by recent messages or recent scenes, you should respond purely with JSON to request system info:

{"keywords": []}

You should extract keywords from the user's prompt, and put them in the keywords array. All keywords should be singular.
If you are requesting system info, you should include nothing else in your message except for this JSON. Do not wrap the JSON in markdown codeblocks and do not use \` symbols.
You should only use this feature if you need to. If you can answer the user's question with recent scenes and recent messages, do that.`;

  return promptSegment;
}

function addPostRAGInstruction() {
  const promptSegment = `Inventing Details: If the user asks events or story details not covered by recent messages, recent scenes or past scenes, you should do the following:
1. if the player is asking about the current scene, invent details
2. If the player is asking about past events, say you don't know`;

  return promptSegment;
}

function addActionDifficultyInstruction() {}
