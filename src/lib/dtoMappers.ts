import { Message, Scene, SceneKeyword, Keyword } from "@/generated/prisma";
import { MessageDTO, SceneDTO } from "./dtos";

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
