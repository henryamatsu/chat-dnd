import { GoogleGenAI } from "@google/genai";
import {
  getMessageCount,
  findRecentMessages,
} from "../controllers/messageController";
import { manageInventory, retrieveScenes } from "../rag";
import { findRecentScenes } from "../controllers/sceneController";
import {
  addGeneralInstruction,
  addInventoryFetchInstruction,
  addJSONResponseInstruction,
  addPostInventoryFetchInstruction,
  addPostSceneFetchInstruction,
  addSceneFetchInstruction,
} from "./promptSegments";
import { removeInventory } from "../controllers/characterController";
import { InventoryCommands } from "../types";

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

async function addGeneralPrefix(prompt: string) {
  const promptSegment = `${addGeneralInstruction()}
  ${addCurrentPrompt(prompt)}
  ${await addRecentScenes()}
  ${await addRecentMessages()}`;

  return promptSegment;
}

export async function processGeneralPrompt(prompt: string) {
  const fullPrompt = `${await addGeneralPrefix(prompt)}
  ${addSceneFetchInstruction()}
  ${addInventoryFetchInstruction()}
  ${addJSONResponseInstruction()}
`;

  console.log("Initial Prompt: ", fullPrompt);

  let reply = await passPromptToGemini(fullPrompt);

  console.log("Initial Reply: ", reply);

  let count = 0;
  while (reply.startsWith("{") || reply.startsWith("```json")) {
    if (count >= 3) break;
    count++;

    console.log("Layered System Requests: ", count);

    if (reply.startsWith("```json")) {
      reply = reply.slice(7, reply.length - 3).trim();
    }

    reply = await triageSystemInstructions(prompt, reply);
  }

  return reply;
}

async function triageSystemInstructions(prompt: string, ragRequest: string) {
  const {
    reply,
    items,
    keywords,
    inventory,
  }: {
    reply: string | undefined;
    items: [{ name: string; count: number }] | undefined;
    keywords: string[] | undefined;
    inventory: InventoryCommands | undefined;
  } = JSON.parse(ragRequest);

  let fullPrompt = `${await addGeneralPrefix(prompt)}`;

  if (keywords !== undefined) {
    fullPrompt += `${await addPastScenesJSON(keywords)}
    ${addPostSceneFetchInstruction()}`;
  }

  if (inventory !== undefined) {
    fullPrompt += `${await addInventoryJSON(inventory)}
    ${addPostInventoryFetchInstruction()}`;
  }

  if (items !== undefined) {
    await removeInventory(1, items);
  }

  if (reply !== undefined) {
    return reply;
  }

  console.log("system assistance: ", fullPrompt);

  return await passPromptToGemini(fullPrompt);
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

export async function processInventoryManagement(
  prompt: string,
  ragRequest: string
) {}

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

async function addPastScenesJSON(keywords: string[]) {
  const scenes = retrieveScenes(keywords);

  const promptSegment = `Past Scenes: ${JSON.stringify(scenes)}`;
  return promptSegment;
}

async function addInventoryJSON(commands: InventoryCommands) {
  const promptSegment = await manageInventory(commands);

  return promptSegment;
}

/*
Alright, here's big brain. We literally just send inventory, ask the AI to see if the item being talked about in recent messages is in the inventory list.
The reason it has to be in AI checking is in case there is a loose match. In




*/
