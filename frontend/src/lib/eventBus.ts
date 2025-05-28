import mitt from "mitt";
import { PlayerEvent } from "@/store/websocket/types";

// Define all possible event types
export type EventTypes = {
  // Music Player Events
  "player:play": PlayerEvent;
  "player:pause": PlayerEvent;
  "player:resume": PlayerEvent;
  "player:seek": PlayerEvent;
  "player:progress": PlayerEvent;
  "player:close": PlayerEvent;
  /*   "player:volumeChange": number;
  "player:playbackRateChange": number;
  "player:trackEnd": void;
  "player:trackError": Error;
  "player:buffering": boolean; */

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
