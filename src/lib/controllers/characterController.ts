import { PrismaClient, Role } from "@/generated/prisma";
import { CharacterDTO, ItemDTO } from "../dtos";
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

export async function checkInventory(id: number) {
  const character = await prisma.character.findUnique({
    where: { id },
  });

  if (!character) throw new Error("character not found");

  const inventory = JSON.stringify(character.inventory);
  return inventory;
}

export async function addInventory(id: number, items: ItemDTO[]) {
  const character = await prisma.character.findUnique({
    where: { id },
  });

  if (!character) throw new Error("Character not found");

  let inventory = character.inventory as ItemDTO[];

  if (!Array.isArray(inventory)) inventory = [];

  // Add or stack each item
  for (const item of items) {
    const existing = inventory.find((i) => i.name === item.name);
    if (existing) {
      existing.count += item.count;
    } else {
      inventory.push({ name: item.name, count: item.count });
    }
  }

  // Save updated inventory
  const updatedCharacter = await prisma.character.update({
    where: { id },
    data: { inventory },
  });

  return updatedCharacter.inventory;
}

export async function removeInventory(id: number, items: ItemDTO[]) {
  const character = await prisma.character.findUnique({
    where: { id },
  });

  if (!character) throw new Error("Character not found");

  let inventory = character.inventory as ItemDTO[];

  if (!Array.isArray(inventory)) inventory = [];

  // Process each item to remove
  for (const item of items) {
    const existing = inventory.find((i) => i.name === item.name);
    if (!existing) continue; // item not found, skip

    if (item.count === -1 || item.count >= existing.count) {
      // remove the item entirely
      inventory = inventory.filter((i) => i.name !== item.name);
    } else {
      // reduce the count
      existing.count -= item.count;
    }
  }

  // Save updated inventory
  await prisma.character.update({
    where: { id },
    data: { inventory },
  });
}

export async function inspectCharacterAbilities(id: number) {
  const character = await prisma.character.findUnique({
    where: { id },
  });

  if (!character) throw new Error("character not found");

  const abilities = character.abilities;

  return abilities;
}
