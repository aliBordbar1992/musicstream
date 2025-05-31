import React from "react";
import { ChatMessage as ChatMessageType } from "@/types/domain";
import { groupMessagesBySender } from "./groupingUtils";
import ChatMessageGroup from "./ChatMessageGroup";

interface ChatContainerProps {
  messages: ChatMessageType[];
  currentUser: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  currentUser,
}) => {
  const grouped = groupMessagesBySender(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {grouped.map((group, idx) => (
        <ChatMessageGroup
          key={group[0].timestamp + group[0].username + idx}
          messages={group}
          isCurrentUser={group[0].username === currentUser}
        />
      ))}
    </div>
  );
};

export default ChatContainer;
