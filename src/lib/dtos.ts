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
