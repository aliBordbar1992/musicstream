package websocket

import "github.com/aliBordbar1992/musicstream-backend/internal/domain"

// BaseEvent represents the common structure for all WebSocket events
type BaseEvent struct {
	Type    string      `json:"t"`
	Payload interface{} `json:"p"`
}

// UserEventPayload represents the payload for user-related events
type UserEventPayload struct {
	Username string `json:"u"`
}

// UserPositionEventPayload represents the payload for user position events
type UserPositionEventPayload struct {
	Username string  `json:"u"`
	Position float64 `json:"p"`
}

// UserJoinSessionEventPayload represents the payload for user joining a session
type UserJoinSessionEventPayload struct {
	Username       string  `json:"u"`
	Name           *string `json:"n,omitempty"`
	ProfilePicture *string `json:"pp,omitempty"`
	Position       float64 `json:"p"`
}

// JoinSessionPayload represents the payload for joining a session
type JoinSessionPayload struct {
	MusicID  uint    `json:"music_id"`
	Position float64 `json:"position"`
}

// ProgressPayload represents the payload for progress updates
type ProgressPayload struct {
	Position float64 `json:"p"`
}

// ListenersPayload represents the payload for current listeners response
type ListenersPayload struct {
	Listeners []*domain.Listener `json:"l"`
}

// ChatMessagePayload represents the payload for chat messages
type ChatMessagePayload struct {
	Username       string  `json:"u"`
	Name           *string `json:"n,omitempty"`
	ProfilePicture *string `json:"pp,omitempty"`
	Message        string  `json:"m"`
	Timestamp      int64   `json:"ts"`
}

// Event types
const (
	EventTypeUserJoined       = "user_joined"
	EventTypeUserLeft         = "user_left"
	EventTypeJoinSession      = "join_session"
	EventTypeLeaveSession     = "leave_session"
	EventTypeGetListeners     = "get_listeners"
	EventTypeCurrentListeners = "current_listeners"
	EventTypeProgress         = "progress"
	EventTypeSeek             = "seek"
	EventTypePause            = "pause"
	EventTypeResume           = "resume"
	EventTypeChatMessage      = "chat_message"
)
