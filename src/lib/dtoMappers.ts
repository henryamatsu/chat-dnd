import { Message } from "@/generated/prisma";
import { MessageDTO } from "./dtos";

export function mapMessageToDTO(message: Message) {
  const dto: MessageDTO = {
    id: message.id,
    text: message.text,
    role: message.role,
  };

  return dto;
}
