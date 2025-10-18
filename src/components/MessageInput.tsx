"use client";

import { useState } from "react";

type Props = {
    onSend: (message: string) => Promise<void>
}

export default function MessageInput(props: Props) {
    const {onSend} = props;
    const [inputText, setInputText] = useState("");

    function handleSend() {
        if (inputText.trim() === "") return;

        onSend(inputText);
        setInputText("");
    }

    return (
        <div className="flex gap-2 mt-4">
            <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-3 rounded-2xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 rounded-2xl transition">
                Send
            </button>
        </div>
    );
}
