"use client";

import React, { useState, useRef, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import { ChatMessage } from "@/types/domain";
import { useAuth } from "@/store/AuthContext";
import ChatContainer from "./ChatContainer";

interface ChatProps {
  currentMusicId: number | null;
}

interface PendingMessage {
  id: string;
  message: string;
  timestamp: number;
  error?: boolean;
}

type MergedMessage = ChatMessage & {
  pending: boolean;
  error: boolean;
  id?: string;
};

export function Chat({ currentMusicId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleMessageReceived = (data: {
      message: string;
      username: string;
      name: string | null;
      profilePicture: string | null;
      timestamp: number;
    }) => {
      setMessages((prev) => [
        ...prev,
        {
          username: data.username,
          name: data.name,
          profilePicture: data.profilePicture,
          message: data.message,
          timestamp: data.timestamp,
        },
      ]);

      if (data.username === user?.username) {
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.message !== data.message)
        );
      }
    };

    eventBus.on("chat:msg_received", handleMessageReceived);

    return () => {
      eventBus.off("chat:msg_received", handleMessageReceived);
    };
  }, [user?.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentMusicId) return;

    const messageId = Math.random().toString(36).substring(7);
    const timestamp = Date.now();

    setPendingMessages((prev) => [
      ...prev,
      { id: messageId, message: newMessage, timestamp },
    ]);

    try {
      eventBus.emit("chat:msg_sent", { message: newMessage });
      setNewMessage("");
    } catch {
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, error: true } : msg
        )
      );
    }
  };

  const mergedMessages: MergedMessage[] = [
    ...messages.map((msg) => ({ ...msg, pending: false, error: false })),
    ...pendingMessages.map((msg) => ({
      username: user?.username || "",
      name: user?.name || user?.username || "",
      profilePicture: user?.profile_picture || null,
      message: msg.message,
      timestamp: msg.timestamp,
      pending: true,
      error: msg.error || false,
      id: msg.id,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Chat</h2>
      </div>

      {currentMusicId ? (
        <ChatContainer
          messages={mergedMessages}
          currentUser={user?.username || ""}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">Join a music session to start chatting</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as unknown as React.FormEvent);
              }
            }}
            placeholder={
              currentMusicId ? "Type a message..." : "Join a session to chat..."
            }
            disabled={!currentMusicId}
            rows={1}
            className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none min-h-[2.5rem] max-h-32 overflow-y-auto ${
              currentMusicId
                ? "bg-gray-700 text-white focus:ring-blue-500"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
            }}
          />
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleSendMessage(e as unknown as React.FormEvent)
            }
            disabled={!currentMusicId}
            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 self-end ${
              currentMusicId
                ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
