export function addGeneralInstruction() {
  const promptSegment = `You are the game master for a ttrpg.`;
  return promptSegment;
}

export function addSceneFetchInstruction() {
  const promptSegment = `Referecing Past Scenes: If the user asks about events or story details not covered by recent messages or recent scenes, you should respond with JSON to request system info:

{"keywords": string[]}

You should extract keywords from the user's prompt, and put them in the keywords array. All keywords should be singular.`;

  return promptSegment;
}

export function addPostSceneFetchInstruction() {
  const promptSegment = `Inventing Details: If the user asks events or story details not covered by recent messages, recent scenes or past scenes, you should do the following:
1. if the player is asking about the current scene, invent details
2. If the player is asking about past events, say you don't know`;

  return promptSegment;
}

export function addInventoryFetchInstruction() {
  const promptSegment = `Referencing inventory: If the user indicates they want to perform an action that involves an item, you should respond with JSON to request system info:

  {"inventory": {
    "add": [{"name": string, "count": number}],
    "remove": boolean,
    "check": boolean,
  }}

  If the user wants to add an item, include the items in the add array.
  If the user wants to remove an item, set remove to true.
  If the user wants to use an item in any other way, set check to true.`;

  return promptSegment;
}

export function addPostInventoryFetchInstruction() {
  const promptSegment = `Using Items: If the item the character is trying to use doesn't exist in the $INVENTORY array,
  they can't use it.`;

  return promptSegment;
}

export function addInventoryRemovalInstruction() {
  const promptSegment = `Respond with JSON in the following format:

    {items: [{name: string, count: number}], reply: string}

    If the item(s) to remove is present in the array, create an item entry with the name and the number to remove. To remove all, set count to -1.
    Reply should hold your reply to the user's prompt.`;

  return promptSegment;
}

export function addJSONResponseInstruction() {
  const promptSegment = `If you are requesting system info with JSON, you should include nothing else in your message except for JSON.
  Do not wrap JSON in markdown codeblocks and do not use \` symbols. If you need multiple pieces of system info, you should join the JSON objects together at the top level.`;

  return promptSegment;
}

export function addActionDifficultyInstruction() {}
