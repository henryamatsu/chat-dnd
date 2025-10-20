"use client";

import { CharacterDTO } from "@/lib/dtos";
import { getCharacterById } from "@/lib/serverActions";
import { useEffect, useState } from "react";

export default function CharacterSheet() {
  const [character, setCharacter] = useState<CharacterDTO | null>(null);

  useEffect(() => {
    (async () => {
      const characterId = 1;
      const characterData = await getCharacterById(characterId);

      setCharacter(characterData);
    })();
  }, []);

  return (
    character && (
      <div className="w-[300px] bg-gray-800 text-white rounded-2xl shadow-xl p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">{character.name}</h2>

        <div className="flex justify-between items-center bg-gray-700 p-2 rounded-lg">
          <span className="font-semibold">Health:</span>
          <span className="text-red-400">{character.health}</span>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Inventory</h3>
          <ul className="bg-gray-700 p-2 rounded-lg space-y-1">
            {character.inventory.length > 0 ? (
              character.inventory.map((item, index) => (
                <li key={index} className="text-sm">
                  • {item}
                </li>
              ))
            ) : (
              <li className="text-sm italic text-gray-400">Empty</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Abilities</h3>
          <ul className="bg-gray-700 p-2 rounded-lg space-y-1">
            {character.abilities.length > 0 ? (
              character.abilities.map((ability, index) => (
                <li key={index} className="text-sm">
                  • {ability}
                </li>
              ))
            ) : (
              <li className="text-sm italic text-gray-400">None</li>
            )}
          </ul>
        </div>
      </div>
    )
  );
}
