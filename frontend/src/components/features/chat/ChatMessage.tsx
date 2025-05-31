import React from "react";
import { ChatMessage as ChatMessageType } from "@/types/domain";
import MessageBubble from "./MessageBubble";
import { format } from "date-fns";

interface ChatMessageProps {
  message: ChatMessageType;
  showName: boolean;
  showTail: boolean;
  isCurrentUser: boolean;
  theme?: "light" | "dark";
}

function getString(val?: string | null): string | undefined {
  return typeof val === "string" ? val : undefined;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  showName,
  showTail,
  isCurrentUser,
  theme = "light",
}) => (
  <div className="flex items-end gap-2">
    <MessageBubble
      username={
        showName
          ? getString(message.name) ?? getString(message.username)
          : undefined
      }
      time={format(message.timestamp, "HH:mm")}
      showUsername={showName}
      theme={theme}
      showTail={showTail}
      isCurrentUser={isCurrentUser}
    >
      {message.message}
    </MessageBubble>
  </div>
);

export default ChatMessage;
