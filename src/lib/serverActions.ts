"use server";

import { processGeneralPrompt, processRAGPrompt } from "./AI/gemini";
import { MessageDTO } from "./dtos";

export async function queryMessageReply(message: MessageDTO) {
    let replyText = await processGeneralPrompt(message.text);

    if (replyText.startsWith("{")) {
        replyText = await processRAGPrompt(message.text, replyText);
    }

    const reply: MessageDTO = { role: "chatbot", text: replyText};
    return reply;
}