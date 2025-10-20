import CharacterSheet from "@/components/CharacterSheet";
import MessageFeed from "@/components/MessageFeed";

export default function Home() {
  return (
    <main>
      <div className="flex">
        <MessageFeed />
        <CharacterSheet />
      </div>
    </main>
  );
}
