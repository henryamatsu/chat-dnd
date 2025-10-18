"use server";

import { MessageDTO } from "./dtos";

export async function queryMessageResponse(message: MessageDTO) {
    console.log(message);

    const reply: MessageDTO = { role: "model", text: "wow that's so smart"};
    return reply;
}