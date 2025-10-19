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
  const messageCount = 20;
  const recentMessages = await prisma.message.findMany({
    where: { campaignId: 1 },
    orderBy: { number: "desc" },
    take: messageCount,
  });

  recentMessages.reverse();
  return recentMessages.map((message) => mapMessageToDTO(message));
}

export async function getMessageCount() {
  const count = await prisma.message.count({
    where: { campaignId: 1 },
  });

  return count;
}

export async function messageUpload() {
  const messages: { text: string; role: Role }[] = [
    { text: "where are we?", role: "user" },
    {
      text: "You stand amid the moss-covered ruins of what appears to have once been an elven village. Elegant stone arches, now cracked and strangled by ivy, rise around you like ancient ribs. A pale mist curls around your ankles, carrying with it the faint scent of lavender and ozone. Somewhere deeper in the ruins, you hear the distant creak of wood… or perhaps bone.",
      role: "chatbot",
    },
    { text: "does it look abandoned?", role: "user" },
    {
      text: "At first glance, yes—but then you notice a few subtle signs of recent activity. Fresh footprints in the soft moss. A roughly patched tarp strung between two fallen pillars. And on a nearby stone table, a still-steaming wooden bowl of porridge.",
      role: "chatbot",
    },
    { text: "is the porridge poisoned?", role: "user" },
    {
      text: "You lean in to inspect. The aroma is surprisingly pleasant—honey and roasted nuts. No immediate smell of bitterness or metal. But faint green flecks swirl within the oats, glimmering softly like crushed emeralds.",
      role: "chatbot",
    },
    { text: "i poke it with my dagger", role: "user" },
    {
      text: "The surface ripples unnaturally at the slightest touch, almost as if the porridge itself inhales. A soft, melodic hum vibrates through the bowl. Your dagger quivers in your hand.",
      role: "chatbot",
    },
    { text: "i back away slowly", role: "user" },
    {
      text: "You step back, careful not to make a sound. The humming ceases. Somewhere behind you, a twig snaps.",
      role: "chatbot",
    },
    { text: "i spin around", role: "user" },
    {
      text: "Standing partially obscured by a curtain of hanging moss is a figure in ragged robes. Their face is hidden beneath a bark-carved mask etched with glowing runes. They hold a staff shaped like twisted vinewood, and they freeze as you turn.",
      role: "chatbot",
    },
    { text: "do they look hostile?", role: "user" },
    {
      text: "Their body is tense, but not aggressive. They raise one hand slowly—palm outward in what could be a greeting… or a warning.",
      role: "chatbot",
    },
    { text: "i say hello in elvish", role: "user" },
    {
      text: 'The figure tilts their head. The glowing runes on the mask pulse once. In a soft, crackling voice, like wind through dry leaves, they reply in perfect Elvish: "Why have you entered the resting place of the Ungrown?"',
      role: "chatbot",
    },
    { text: "who are the ungrown?", role: "user" },
    {
      text: 'The figure’s grip tightens on their staff. "Children who never took root. Spirits denied form. They linger still." As they speak, the mist around your feet begins to churn and rise, coalescing into dozens of small, grasping hands.',
      role: "chatbot",
    },
    { text: "i jump onto the nearest stone table", role: "user" },
    {
      text: "You leap onto the table just as the spectral hands claw at the spot where you stood. The bowl of porridge slides toward the edge—and tips.",
      role: "chatbot",
    },
  ];

  for (const { text, role } of messages) {
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
}

// messageUpload();
