import {
  addInventoryRemovalInstruction,
  addJSONResponseInstruction,
} from "./AI/promptSegments";
import {
  addInventory,
  checkInventory,
} from "./controllers/characterController";
import { InventoryCommands } from "./types";

export function retrieveScenes(keywords: string[]) {
  const dummyScenes = [
    {
      sceneNumber: 1,
      text: "The heroes fought a band of goblins at the king's pass",
      keywords: ["king's pass", "goblin"],
    },
    {
      sceneNumber: 2,
      text: "The heroes attended a feast held by a local lord",
      keywords: ["feast", "lord"],
    },
    {
      sceneNumber: 3,
      text: "The heroes were ambushed by goblins in a dark alleyway",
      keywords: ["goblin", "alleyway", "ambush"],
    },
  ];

  const relevantScenes = dummyScenes.filter((scene) => {
    return keywords.some((keyword) => {
      return scene.keywords.includes(keyword);
    });
  });

  return relevantScenes;
}

export async function manageInventory({
  add,
  remove,
  check,
}: InventoryCommands) {
  if (add && add.length > 0) {
    await addInventory(1, add);
    return "Inventory: Items successfully added.";
  }
  if (remove || check) {
    let inventory = await checkInventory(1);

    if (remove) {
      return `Inventory: ${inventory}
      ${addInventoryRemovalInstruction()}
      ${addJSONResponseInstruction()}`;
    } else {
      return `Inventory: ${inventory}`;
    }
  }

  return null;
}

export async function finishInventoryRemoval(item: string) {}
