import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function createScene(
  campaignId: number,
  text: string,
  keywords: string[]
) {
  // generate scene details
  const newScene = generateScene();

  // get next number
  const lastScene = await prisma.scene.findFirst({
    where: { campaignId },
    orderBy: { number: "desc" },
  });
  const nextNumber = (lastScene?.number || 0) + 1;

  return prisma.scene.create({
    data: {
      campaignId,
      number: nextNumber,
      text,
      keywords: {
        create: keywords.map((word) => ({
          keyword: {
            connectOrCreate: {
              where: { text: word },
              create: { text: word },
            },
          },
        })),
      },
    },
    include: { keywords: { include: { keyword: true } } },
  });
}

async function generateScene() {}

export async function findScenesByKeyword(keywords: string[]) {
  const scenes = await prisma.scene.findMany({
    where: {
      keywords: {
        some: {
          keyword: { text: { in: keywords } },
        },
      },
    },
    include: { keywords: { include: { keyword: true } } },
  });

  return scenes;
}

export async function findScenesByKeywordRanked(keywords: string[]) {
  // Fetch all scenes that have at least one of the keywords
  const scenes = await prisma.scene.findMany({
    where: {
      keywords: {
        some: {
          keyword: { text: { in: keywords } },
        },
      },
    },
    include: { keywords: { include: { keyword: true } } },
  });

  // Count matches and attach a "rank" to each scene
  const rankedScenes = scenes.map((scene) => {
    const matchedCount = scene.keywords.filter((k) =>
      keywords.includes(k.keyword.text)
    ).length;

    return { ...scene, matchedCount };
  });

  // Sort by matchedCount descending (highest match first)
  rankedScenes.sort((a, b) => b.matchedCount - a.matchedCount);

  return rankedScenes;
}
