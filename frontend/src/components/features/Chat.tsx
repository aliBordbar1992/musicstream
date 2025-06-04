"use client";

import React, { useState, useRef, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import { ChatMessage } from "@/types/domain";
import { format } from "date-fns";
import { useAuth } from "@/features/auth/AuthContext";
import UserImage from "../ui/UserImage";

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
  const [newMessage, setNewMessage] = useState("");
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

      // Remove the message from pending if it was sent by the current user
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

    // Add to pending messages
    setPendingMessages((prev) => [
      ...prev,
      { id: messageId, message: newMessage, timestamp },
    ]);

    try {
      eventBus.emit("chat:msg_sent", { message: newMessage });
      setNewMessage("");
    } catch {
      // Mark the message as failed
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, error: true } : msg
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleRetry = async (messageId: string) => {
    const message = pendingMessages.find((msg) => msg.id === messageId);
    if (!message) return;

    try {
      eventBus.emit("chat:msg_sent", { message: message.message });
      setPendingMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      // Keep the error state
      console.error("Failed to retry sending message:", error);
    }
  };

  // Merge messages and pendingMessages for rendering
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

  // Type guard for pending message
  function isPendingMessage(
    msg: MergedMessage
  ): msg is MergedMessage & { id: string } {
    return msg.pending && typeof msg.id === "string";
  }

  if (!currentMusicId) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-neutral-800 rounded-lg shadow ">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Chat</h2>
        </div>

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

        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              disabled
              placeholder="Join a session to chat..."
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
            />
            <button
              disabled
              className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-800 rounded-lg shadow ">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mergedMessages.map((msg, index) => {
          const isOwnMessage = msg.username === user?.username;
          return (
            <div
              key={`${msg.username}-${msg.timestamp}-${index}`}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[70%] ${
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                } items-end gap-2`}
              >
                <div className="flex-shrink-0">
                  {msg.profilePicture ? (
                    <UserImage
                      src={msg.profilePicture}
                      alt={msg.name || msg.username}
                      size="sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white text-sm">
                        {(msg.name || msg.username)[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`flex flex-col ${
                    isOwnMessage ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg relative group ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    {msg.pending && msg.error && isPendingMessage(msg) && (
                      <button
                        onClick={() => handleRetry(msg.id)}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Retry sending message"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {msg.name || msg.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(msg.timestamp, "HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleSendMessage(e as unknown as React.FormEvent)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
