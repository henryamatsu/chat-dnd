"use client";

import { MessageDTO } from "@/lib/dtos";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useEffect, useRef, useState } from "react";
import { getRecentMessages, queryMessageReply } from "@/lib/serverActions";

export default function MessageFeed() {
  let [messages, setMessages] = useState<MessageDTO[]>([]);
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const recentMessages: MessageDTO[] = await getRecentMessages();
      setMessages(recentMessages);
    })();
  }, []);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) {
      feed.scrollTo({
        top: feed.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  async function onSend(text: string) {
    const tempMessage: MessageDTO = {
      id: -1,
      text,
      role: "user",
    };
    setMessages((prev) => [...prev, tempMessage]);
    const updatedMessages = await queryMessageReply(text);
    setMessages(updatedMessages);
  }

  return (
    <div
      ref={feedRef}
      className="flex flex-col w-[800px] max-w-full h-screen bg-gray-900 rounded-2xl shadow-xl p-6 gap-4 overflow-y-auto"
    >
      {messages &&
        messages.map((message, i) => (
          <MessageBubble key={i} message={message} />
        ))}
      <MessageInput onSend={onSend} />
      <div></div>
    </div>
  );
}
