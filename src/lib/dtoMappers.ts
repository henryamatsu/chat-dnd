import {
  Message,
  Scene,
  SceneKeyword,
  Keyword,
  Character,
} from "@/generated/prisma";
import { CharacterDTO, MessageDTO, SceneDTO } from "./dtos";

export function mapMessageToDTO(message: Message) {
  const dto: MessageDTO = {
    id: message.id,
    text: message.text,
    role: message.role,
  };

  return dto;
}

export function mapSceneToDTO(
  scene: Scene & { keywords: (SceneKeyword & { keyword: Keyword })[] }
) {
  const dto: SceneDTO = {
    id: scene.id,
    text: scene.text,
    keywords: scene.keywords.map((entry) => entry.keyword.text),
  };

  return dto;
}

export function mapCharacterToDTO(character: Character): CharacterDTO {
  const dto: CharacterDTO = {
    name: character.name,
    health: character.health,
    inventory: Array.isArray(character.inventory)
      ? (character.inventory as string[])
      : [],
    abilities: Array.isArray(character.abilities)
      ? (character.abilities as string[])
      : [],
  };

  return dto;
}
