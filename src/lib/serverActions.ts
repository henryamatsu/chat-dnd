"use server";
// I'm basically going to treat this as a router file, and put the business logic in a separate controller file(s)


import { processGeneralPrompt, processSceneRAGPrompt } from "./AI/gemini";
import { MessageDTO } from "./dtos";

export async function queryMessageReply(message: MessageDTO) {
    let replyText = await processGeneralPrompt(message.text);

    if (replyText.startsWith("{")) {
        replyText = await processSceneRAGPrompt(message.text, replyText);
    }

    const reply: MessageDTO = { role: "chatbot", text: replyText};
    return reply;
}