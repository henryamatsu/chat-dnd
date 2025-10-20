import { PrismaClient, Role } from "@/generated/prisma";
import { CharacterDTO } from "../dtos";
import { mapCharacterToDTO } from "../dtoMappers";

const prisma = new PrismaClient();

export async function findCharacterById(id: number) {
  const character = await prisma.character.findUnique({
    where: { id },
  });

  if (!character) throw new Error("character not found");

  const dto = mapCharacterToDTO(character);

  return dto;
}
