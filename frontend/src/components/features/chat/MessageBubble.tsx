import React from "react";
import { colors, borderRadius } from "@/lib/theme";

interface MessageBubbleProps {
  avatarUrl?: string;
  username?: string;
  time?: string;
  children: React.ReactNode;
  showUsername?: boolean;
  theme?: "light" | "dark";
  showTail?: boolean;
  isCurrentUser?: boolean;
}

// Function to detect if text is RTL
const isRTL = (text: string): boolean => {
  const rtlRegex =
    /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(text);
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  username,
  time,
  children,
  showUsername = false,
  theme = "light",
  showTail = false,
  isCurrentUser = false,
}) => {
  // Pick colors based on theme
  const bubbleBg =
    theme === "dark" ? colors.secondary[700] : colors.secondary[200];
  const textColor =
    theme === "dark" ? colors.secondary[50] : colors.secondary[900];
  const usernameTextColor =
    theme === "dark" ? colors.secondary[100] : colors.secondary[900];
  const tailColor = bubbleBg;

  const currentUserBubbleBg =
    theme === "dark" ? colors.primary[700] : colors.primary[200];
  const currentUserTextColor =
    theme === "dark" ? colors.primary[50] : colors.primary[900];
  const currentUserUsernameTextColor =
    theme === "dark" ? colors.primary[100] : colors.primary[900];
  const currentUserTailColor = currentUserBubbleBg;

  // Detect if the message content is RTL
  const messageContent = React.Children.toArray(children)[0] as string;
  const isMessageRTL =
    typeof messageContent === "string" && isRTL(messageContent);

  return (
    <div className="flex items-end mb-2">
      <div className="flex flex-col">
        <div className="relative flex flex-col">
          {/* Bubble */}
          <div
            className="px-2 py-1 min-w-[5rem] max-w-[60vw] break-words relative"
            style={{
              background: isCurrentUser ? currentUserBubbleBg : bubbleBg,
              color: isCurrentUser ? currentUserTextColor : textColor,
              borderRadius: `${borderRadius.md}`,
              borderTopLeftRadius: borderRadius.md,
              borderTopRightRadius: "1rem",
              borderBottomLeftRadius: showTail
                ? borderRadius.none
                : borderRadius.md,
              borderBottomRightRadius: "1rem",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {/* Username inside first bubble */}
            {showUsername && username && (
              <span
                className="text-xs font-semibold mb-2"
                style={{
                  color: isCurrentUser
                    ? currentUserUsernameTextColor
                    : usernameTextColor,
                  fontWeight: 700,
                }}
              >
                {username}
              </span>
            )}
            <div className="relative pb-6 pr-4">
              <p
                className={`whitespace-pre-wrap break-words ${
                  isMessageRTL ? "font-iranYekan text-iran-sm" : ""
                }`}
                style={{
                  textAlign: isMessageRTL ? "right" : "left",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {children}
              </p>

              {time && (
                <span
                  className={`absolute right-2 bottom-1 ${
                    isMessageRTL ? "text-iran-xs" : "text-xs"
                  } opacity-60`}
                  style={{ color: textColor }}
                >
                  {time}
                </span>
              )}
            </div>

            {/* Tail (only shown if showTail is true) */}
            {showTail && (
              <span
                className="absolute bottom-0 left-[-8px] w-0 h-0"
                style={{
                  borderTop: "10px solid transparent",
                  borderBottom: "0 solid transparent",
                  borderRight: `10px solid ${
                    isCurrentUser ? currentUserTailColor : tailColor
                  }`,
                  borderRadius: 0,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
