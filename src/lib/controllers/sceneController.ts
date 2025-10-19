import { PrismaClient } from "@/generated/prisma";
import { processMessagesIntoScene } from "../AI/gemini";
import { mapSceneToDTO } from "../dtoMappers";

const prisma = new PrismaClient();

export async function createScene() {
  // generate scene details
  const newScene = await processMessagesIntoScene();

  if (newScene === null) return;

  const { text, keywords } = newScene;

  // get next number
  const lastScene = await prisma.scene.findFirst({
    where: { campaignId: 1 },
    orderBy: { number: "desc" },
  });
  const nextNumber = (lastScene?.number || 0) + 1;

  return await prisma.scene.create({
    data: {
      campaignId: 1,
      number: nextNumber,
      text,
      keywords: {
        create: keywords.map((word: string) => ({
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

export async function findRecentScenes() {
  const sceneCount = 10;
  const recentScenes = await prisma.scene.findMany({
    where: { campaignId: 1 },
    orderBy: { number: "asc" },
    take: sceneCount,
    include: {
      keywords: {
        include: {
          keyword: true,
        },
      },
    },
  });

  return recentScenes.map((scene) => mapSceneToDTO(scene));
}

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

export async function sceneUpload() {
  const scenes = [
    {
      keywords: ["forest", "path", "dawn", "mist", "bird"],
      text: "At dawn, the player walks along a winding forest path. Mist clings to the mossy ground, and the air is filled with the chirping of early birds. Sunlight filters through the dense canopy, casting dappled shadows.",
    },
    {
      keywords: ["river", "bridge", "fish", "stone", "moss"],
      text: "The path leads to a gentle river crossed by an old stone bridge. Water glimmers as small fish dart beneath the surface, and moss creeps over the edges of the stones. The sound of flowing water is calming.",
    },
    {
      keywords: ["clearing", "flowers", "butterfly", "sunlight", "wind"],
      text: "The player reaches a sunlit clearing filled with wildflowers. Butterflies flit among the blooms, and a soft wind carries the scent of blossoms. The scene feels peaceful, almost enchanted.",
    },
    {
      keywords: ["ancient", "tree", "roots", "owl", "cavity"],
      text: "An ancient tree with sprawling roots dominates the next section of the forest. A hollow in its trunk reveals a sleeping owl, and twisted roots form natural steps up the forest floor. Shadows dance as sunlight filters through the leaves.",
    },
    {
      keywords: ["ruins", "statue", "ivy", "crack", "wind"],
      text: "Beyond the tree, the player notices crumbling ruins partially hidden by ivy. A toppled statue lies across a cracked stone floor, and the wind whistles through broken archways. The place feels deserted but hints at a forgotten history.",
    },
    {
      keywords: ["path", "mist", "footprint", "bush", "twig"],
      text: "Following a narrow path, the player finds faint footprints pressed into the moss. A bush rustles nearby, and a snapped twig underfoot suggests something—or someone—passed this way recently. The mist thickens slightly, shrouding the forest in mystery.",
    },
    {
      keywords: ["archway", "ivy", "stone", "shadow", "light"],
      text: "The path leads to a grand, ivy-covered stone archway. Sunlight strikes the mossy stones, casting long shadows. The player notices delicate carvings in the stone, hinting at the artistry of a bygone era.",
    },
    {
      keywords: ["clearing", "ruin", "mist", "scent", "bowl"],
      text: "Finally, the player steps into a larger clearing containing the mossy ruins of a village. Mist curls around the broken stone structures, carrying a faint scent of lavender. On a stone table lies a steaming wooden bowl, untouched but clearly recently used.",
    },
    {
      keywords: ["ruin", "forest", "mist", "porridge", "activity"],
      text: "The player arrives in a misty, overgrown elven ruin, noticing signs of recent activity including fresh footprints and a steaming bowl of porridge with green flecks. The air is scented with lavender and ozone, and the ruins are covered in moss and ivy.",
    },
    {
      keywords: ["porridge", "magic", "figure", "mask", "spirit"],
      text: "Upon investigating the bowl, it ripples and hums unnaturally. The player sees a masked figure with glowing runes approach, speaking of the Ungrown—children spirits denied form—while spectral hands rise from the mist around their feet. The player jumps onto a nearby stone table as the bowl tips.",
    },
  ];

  for (const { text, keywords } of scenes) {
    // get next number
    const lastScene = await prisma.scene.findFirst({
      where: { campaignId: 1 },
      orderBy: { number: "desc" },
    });
    const nextNumber = (lastScene?.number || 0) + 1;

    await prisma.scene.create({
      data: {
        campaignId: 1,
        number: nextNumber,
        text,
        keywords: {
          create: keywords.map((word: string) => ({
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
}

// sceneUpload();
