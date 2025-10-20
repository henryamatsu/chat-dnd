"use server";
// I'm basically going to treat this as a router file, and put the business logic in a separate controller file(s)

import { processGeneralPrompt, processSceneRAGPrompt } from "./AI/gemini";
import { findCharacterById } from "./controllers/characterController";
import {
  createMessage,
  findRecentMessages,
} from "./controllers/messageController";
import { createScene } from "./controllers/sceneController";

export async function getRecentMessages() {
  const messages = await findRecentMessages();
  return messages;
}

export async function queryMessageReply(text: string) {
  let reply = await processGeneralPrompt(text);

  if (reply.startsWith("{")) {
    reply = await processSceneRAGPrompt(text, reply);
  }

  await createMessage(text, "user");
  await createMessage(reply, "chatbot");

  const messages = await getRecentMessages();
  await createScene();

  return messages;
}

export async function getCharacterById(id: number) {
  const character = await findCharacterById(id);

  return character;
}
