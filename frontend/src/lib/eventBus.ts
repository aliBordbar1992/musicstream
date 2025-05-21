import mitt from "mitt";
import { PlayerTrack } from "@/types/domain";

// Define all possible event types
export type EventTypes = {
  // Music Player Events
  "player:play": PlayerTrack;
  "player:clear": void;
  "player:pause": void;
  "player:resume": void;
  "player:seek": number;
  "player:progress": number;
  "player:close": void;
  // WebSocket Session Events
  "session:userJoined": { username: string; position: number };
  "session:userLeft": { username: string };
  "session:progressUpdate": { username: string; position: number };
  "session:seekUpdate": { username: string; position: number };
  "session:pauseUpdate": { username: string };
  "session:resumeUpdate": { username: string };
  "session:error": { message: string };
  "session:connected": void;
  "session:disconnected": void;
};

// Create and export the event bus
export const eventBus = mitt<EventTypes>();
