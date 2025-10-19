import { PrismaClient, Role } from "@/generated/prisma";
import { mapMessageToDTO } from "../dtoMappers";

const prisma = new PrismaClient();

export async function createMessage(text: string, role: Role) {
  // get next number
  const lastMessage = await prisma.message.findFirst({
    where: { campaignId: 1 },
    orderBy: { number: "desc" },
  });
  const nextNumber = (lastMessage?.number || 0) + 1;

  await prisma.message.create({
    data: {
      campaignId: 1,
      number: nextNumber,
      text,
      role,
    },
  });
}

export async function findRecentMessages() {
  const messageCount = 10;
  const recentMessages = await prisma.message.findMany({
    where: { campaignId: 1 },
    orderBy: { number: "asc" },
    take: messageCount,
  });

  return recentMessages.map((message) => mapMessageToDTO(message));
}
