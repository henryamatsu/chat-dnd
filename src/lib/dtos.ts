import { Role } from "@/generated/prisma";

export type MessageDTO = {
  id: number;
  role: Role;
  text: string;
};
