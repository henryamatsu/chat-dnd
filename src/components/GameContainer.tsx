"use client";

import CharacterSheet from "./CharacterSheet";
import MessageFeed from "./MessageFeed";

export default function GameContainer() {
  return (
    <div className="flex">
      <MessageFeed />
      <CharacterSheet />
    </div>
  );
}
