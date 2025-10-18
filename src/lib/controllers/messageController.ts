import { PrismaClient } from "@/generated/prisma";
import { MessageDTO } from "../dtos";

const prisma = new PrismaClient();

export async function createMessage(message: MessageDTO) {
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
      text: message.text,
      role: message.role,
    },
  });
}

export async function findRecentMessages() {
  const messageCount = 10;
  const recentMessages = await prisma.message.findFirst({
    where: { campaignId: 1 },
    orderBy: { number: "desc" },
    take: messageCount,
  });

  return recentMessages;
}
