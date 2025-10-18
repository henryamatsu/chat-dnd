import { Role } from "@/generated/prisma";

export type MessageDTO = {
  role: Role;
  text: string;
};
