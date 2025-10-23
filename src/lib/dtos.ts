import { Role } from "@/generated/prisma";

export type MessageDTO = {
  id: number;
  role: Role;
  text: string;
};

export type SceneDTO = {
  id?: number;
  text: string;
  keywords: string[];
};

export type CharacterDTO = {
  name: string;
  health: number;
  inventory: ItemDTO[];
  abilities: string[];
};

export type ItemDTO = {
  name: string;
  count: number;
};
