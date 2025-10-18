"use server";

import { passPromptToGemini } from "./AI/gemini";
import { MessageDTO } from "./dtos";

export async function queryMessageReply(message: MessageDTO) {
    console.log(message);

    const replyText = await passPromptToGemini(message.text);

    const reply: MessageDTO = { role: "model", text: replyText};
    return reply;
}