import React from "react";
import { ChatMessage as ChatMessageType } from "@/types/domain";
import ChatMessage from "./ChatMessage";
import UserImage from "@/components/ui/UserImage";

interface ChatMessageGroupProps {
  messages: ChatMessageType[];
  isCurrentUser: boolean;
}

const ChatMessageGroup: React.FC<ChatMessageGroupProps> = ({
  messages,
  isCurrentUser,
}) => {
  if (messages.length === 0) return null;

  const firstMessage = messages[0];

  return (
    <div className="flex mb-4">
      {/* Avatar container matches message height */}
      <div className="flex flex-col justify-end pr-1">
        <UserImage
          src={firstMessage.profilePicture}
          alt="avatar"
          className="w-7 h-7 rounded-full mb-2" // 'mb-2' adds space from bottom
        />
      </div>

      <div className="flex flex-col">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={msg.timestamp + msg.message + idx}
            message={msg}
            showName={idx === 0}
            showTail={idx === messages.length - 1}
            isCurrentUser={isCurrentUser}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessageGroup;
