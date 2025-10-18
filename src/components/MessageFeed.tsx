"use client";

import { MessageDTO } from "@/lib/dtos";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useEffect, useState } from "react";
import { queryMessageResponse } from "@/lib/serverActions";

export default function MessageFeed() {
    let [messages, setMessages] = useState<MessageDTO[]>([]);

    useEffect(() => {
        const dummyMessages: MessageDTO[] = [
            { role: "user", text: "Hi There!" },
            { role: "model", text: "Howdy Pardner" },
            { role: "user", text: "Stick 'em up" },
            { role: "model", text: "I'm Dirty Dan" },
        ];

        setMessages(dummyMessages);
    }, []);




    async function onSend(text: string) {
        const message: MessageDTO = {
            role: "user",
            text
        };

        setMessages(prev => [...prev, message]);
        const reply = await queryMessageResponse(message);
        setMessages(prev => [...prev, reply]);
    }

    return (
        <div className="flex flex-col w-[800px] max-w-full h-screen bg-gray-900 rounded-2xl shadow-xl p-6 gap-4 overflow-y-auto">
            {messages && messages.map((message, i) => (
                <MessageBubble key={i} message={message} />
            ))}
            <MessageInput onSend={onSend}/>
        </div>
    );
}
