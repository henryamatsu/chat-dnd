import { MessageDTO } from "@/lib/dtos";
import MessageBubble from "./MessageBubble";

export default function messageFeed() {
    let messages: MessageDTO[] = [];

    const dummyMessages: MessageDTO[] = [
        {
            role: "user",
            text: "Hi There!"
        },
        {
            role: "model",
            text: "Howdy Pardner"
        },
        {
            role: "user",
            text: "Stick 'em up"
        },
    ];

    messages = dummyMessages;

    return (
        <div className="flex flex-col w-[800px]">
            {messages.map((message, i) => <MessageBubble key={i} message={message}/>)}
        </div>
    );
}