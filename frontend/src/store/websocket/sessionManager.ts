import { SessionState, PlayerEvent, WebSocketMessage } from "./types";

export class SessionManager {
  private state: SessionState;

  constructor() {
    this.state = {
      sessionId: null,
      musicId: null,
      isActive: false,
      username: null,
      position: null,
      isClosed: false,
    };
  }

  getState(): SessionState {
    return { ...this.state };
  }

  setUsername(username: string): void {
    this.state.username = username;
  }

  joinSession(sessionId: string, musicId: number): void {
    this.state.sessionId = sessionId;
    this.state.musicId = musicId;
    this.state.isActive = true;
    this.state.isClosed = false;
  }

  leaveSession(): void {
    this.state.sessionId = null;
    this.state.musicId = null;
    this.state.isActive = false;
    this.state.position = null;
    this.state.isClosed = true;
  }

  handleEvent(event: PlayerEvent): WebSocketMessage[] | null {
    if (!event.musicId) return null;

    // If we're closed, only allow play events to rejoin
    if (this.state.isClosed && event.type !== "play") {
      return null;
    }

    if (this.state.musicId === null) {
      console.log("joining session ----- this state is null");
      this.joinSession("default", event.musicId);
      return [
        {
          t: "join_session",
          p: {
            music_id: event.musicId,
            position: event.progress || 0,
          },
        },
        {
          t: "get_listeners",
          p: {},
        },
      ];
    }

    if (this.state.musicId !== event.musicId) {
      console.log(
        "leaving session ----- music id changed",
        this.state.musicId,
        event.musicId
      );
      this.leaveSession();
      this.joinSession("default", event.musicId);
      return [
        {
          t: "join_session",
          p: {
            music_id: event.musicId,
            position: event.progress || 0,
          },
        },
        {
          t: "get_listeners",
          p: {},
        },
      ];
    }

    if (event.type === "close") {
      this.leaveSession();
      return [
        {
          t: "leave_session",
          p: {},
        },
      ];
    }

    // For other events, return the appropriate message type
    switch (event.type) {
      case "play":
        this.state.position = event.progress || 0;
        return [
          {
            t: "play",
            p: {
              music_id: event.musicId,
              timestamp: Date.now(),
            },
          },
        ];
      case "pause":
        return [
          {
            t: "pause",
            p: {
              u: this.state.username || "",
            },
          },
        ];
      case "resume":
        return [
          {
            t: "resume",
            p: {
              u: this.state.username || "",
            },
          },
        ];
      case "progress":
        const shouldReturnMessage =
          (event.progress || 0) - (this.state.position || 0) > 1;

        if (!shouldReturnMessage) {
          return null;
        }

        this.state.position = event.progress || 0;

        return [
          {
            t: "progress",
            p: {
              u: this.state.username || "",
              p: event.progress || 0,
            },
          },
        ];
      default:
        return null;
    }
  }
}
