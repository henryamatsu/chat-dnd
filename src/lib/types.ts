import { ItemDTO } from "./dtos";

export type InventoryCommands = {
  add: ItemDTO[];
  remove: boolean;
  check: boolean;
};
