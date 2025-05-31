import { ChatMessage } from "@/types/domain";

// Groups sequential messages from the same sender
export function groupMessagesBySender(
  messages: ChatMessage[]
): ChatMessage[][] {
  if (!messages.length) return [];
  const groups: ChatMessage[][] = [];
  let currentGroup: ChatMessage[] = [messages[0]];

  for (let i = 1; i < messages.length; i++) {
    if (messages[i].username === messages[i - 1].username) {
      currentGroup.push(messages[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [messages[i]];
    }
  }
  groups.push(currentGroup);
  return groups;
}
