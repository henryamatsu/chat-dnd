import { GoogleGenAI } from "@google/genai";
import {
  getMessageCount,
  findRecentMessages,
} from "../controllers/messageController";
import {
  findRecentScenes,
  findScenesByKeyword,
} from "../controllers/sceneController";
import {
  addGeneralInstruction,
  addInventoryUpdateInstruction,
  addJSONResponseInstruction,
  addPostSceneFetchInstruction,
  addSceneFetchInstruction,
} from "./promptSegments";
import {
  addToInventory,
  getAbilities,
  getInventory,
  removeFromInventory,
} from "../controllers/characterController";
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
  ${addJSONResponseInstruction()}
  ${await addRecentScenes()}
  ${await addRecentMessages()}
  ${await addInventory()}
  ${await addAbilities()}`;

  return promptSegment;
}

export async function processGeneralPrompt(prompt: string) {
  const fullPrompt = `${await addGeneralPrefix(prompt)}
  ${addSceneFetchInstruction()}
  ${addInventoryUpdateInstruction()}
`;

  let reply = await passPromptToGemini(fullPrompt);

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
    keywords,
    inventory,
    reply,
  }: {
    keywords: string[] | undefined;
    inventory: InventoryCommands | undefined;
    reply: string;
  } = JSON.parse(ragRequest);

  let fullPrompt = `${await addGeneralPrefix(prompt)}`;

  if (keywords !== undefined) {
    fullPrompt += `${await addPastScenesJSON(keywords)}
    ${addPostSceneFetchInstruction()}`;
  }

  if (inventory !== undefined) {
    console.log(inventory);
    await processInventoryUpdates(inventory);
    return reply;
  }

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

async function processInventoryUpdates({ add, remove }: InventoryCommands) {
  if (add && add.length > 0) {
    await addToInventory(1, add);
  }
  if (remove && remove.length > 0) {
    await removeFromInventory(1, remove);
  }
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

async function addPastScenesJSON(keywords: string[]) {
  const scenes = await findScenesByKeyword(keywords);
  const promptSegment = `Past Scenes: ${JSON.stringify(scenes)}`;
  return promptSegment;
}

async function addInventory() {
  const inventory = await getInventory(1);
  let promptSegment = "Inventory: ";

  if (inventory.length > 0) {
    promptSegment += inventory;
  } else promptSegment += "<EMPTY>";

  // promptSegment += addInventoryUseInstruction();

  return promptSegment;
}

async function addAbilities() {
  const abilities = await getAbilities(1);
  let promptSegment = "Abilities: ";

  if (abilities.length > 0) {
    promptSegment += abilities;
  } else promptSegment += "<NONE>";

  // promptSegment += addAbilityUseInstruction();

  return promptSegment;
}
