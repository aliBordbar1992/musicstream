"use client";

import React, { useState, useRef, useEffect } from "react";
import { eventBus } from "@/lib/eventBus";
import { ChatMessage } from "@/types/domain";
import Image from "next/image";
import { format } from "date-fns";
import { useAuth } from "@/store/AuthContext";

interface ChatProps {
  currentMusicId: number | null;
}

export function Chat({ currentMusicId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
    };

    eventBus.on("chat:msg_received", handleMessageReceived);

    return () => {
      eventBus.off("chat:msg_received", handleMessageReceived);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentMusicId) return;

    eventBus.emit("chat:msg_sent", { message: newMessage });
    setNewMessage("");
  };

  if (!currentMusicId) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isOwnMessage = msg.username === user?.username;
          return (
            <div
              key={index}
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
                    <Image
                      src={msg.profilePicture}
                      alt={msg.name || msg.username}
                      width={32}
                      height={32}
                      className="rounded-full"
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
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
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

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-700"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
