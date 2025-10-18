"use server";

import { processGeneralPrompt } from "./AI/gemini";
import { MessageDTO } from "./dtos";

export async function queryMessageReply(message: MessageDTO) {
    const replyText = await processGeneralPrompt(message.text);

    const role = replyText.startsWith("{") ? "system" : "chatbot"

    const reply: MessageDTO = { role, text: replyText};
    return reply;
}