package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
)

// SessionManager defines the interface for managing WebSocket sessions
type SessionManager interface {
	JoinSession(username string, musicID uint) error
	LeaveSession(username string, musicID uint) error
	GetCurrentListeners(musicID uint) ([]*domain.Listener, error)
	UpdatePosition(username string, musicID uint, position float64) error
	BroadcastToMusic(musicID uint, message []byte, senderUsername string)
}

// MessageHandler defines the interface for handling WebSocket messages
type MessageHandler interface {
	HandleMessage(client *Client, message []byte)
}

// DefaultMessageHandler implements the MessageHandler interface
type DefaultMessageHandler struct {
	usersRepository domain.UserRepository
	sessionManager  SessionManager
}

// NewDefaultMessageHandler creates a new message handler
func NewDefaultMessageHandler(sessionManager SessionManager, usersRepository domain.UserRepository) *DefaultMessageHandler {
	return &DefaultMessageHandler{
		sessionManager:  sessionManager,
		usersRepository: usersRepository,
	}
}

// HandleMessage processes incoming WebSocket messages
func (h *DefaultMessageHandler) HandleMessage(client *Client, message []byte) {
	var event BaseEvent

	if err := json.Unmarshal(message, &event); err != nil {
		log.Printf("Failed to unmarshal event: %v", err)
		return
	}

	if event.Type == EventTypeJoinSession {
		h.handleJoinSession(client, event.Payload)
		return
	}

	// For all other messages, require client to be in a session
	if client.musicID == nil {
		log.Printf("Client %s not in a session, ignoring %s request", client.username, event.Type)
		return
	}

	switch event.Type {
	case EventTypeLeaveSession:
		h.handleLeaveSession(client)
	case EventTypeGetListeners:
		h.handleGetListeners(client)
	case EventTypeProgress:
		h.handleProgress(client, event.Payload)
	case EventTypeSeek:
		h.handleSeek(client, event.Payload)
	case EventTypePause:
		h.handlePause(client)
	case EventTypeResume:
		h.handleResume(client)
	case EventTypeChatMessage:
		h.handleChatMessage(client, event.Payload)
	default:
		log.Printf("Unknown message type: %s", event.Type)
	}
}

func (h *DefaultMessageHandler) handleJoinSession(client *Client, payload interface{}) {
	log.Println("handling join session message", client.username, payload)

	var data JoinSessionPayload
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Failed to marshal payload: %v", err)
		return
	}

	if err := json.Unmarshal(payloadBytes, &data); err != nil {
		log.Printf("Failed to unmarshal join session payload: %v", err)
		return
	}

	// leave previous session
	h.handleLeaveSession(client)

	if err := h.sessionManager.JoinSession(client.username, data.MusicID); err != nil {
		log.Printf("Failed to join session: %v", err)
		return
	}

	client.musicID = &data.MusicID

	user, err := h.usersRepository.FindByUsername(client.username)
	if err != nil {
		log.Printf("Failed to get user: %v", err)
		return
	}

	event := BaseEvent{
		Type: EventTypeUserJoined,
		Payload: UserJoinSessionEventPayload{
			Username:       client.username,
			Name:           user.Name,
			ProfilePicture: user.ProfilePicture,
			Position:       data.Position,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal join session event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData, client.username)
}

func (h *DefaultMessageHandler) handleLeaveSession(client *Client) {
	if client.musicID == nil {
		return
	}

	musicID := *client.musicID // Store the musicID before nilling it

	if err := h.sessionManager.LeaveSession(client.username, musicID); err != nil {
		log.Printf("Failed to leave session: %v", err)
	}

	client.musicID = nil

	event := BaseEvent{
		Type: EventTypeUserLeft,
		Payload: UserEventPayload{
			Username: client.username,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal leave session event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(musicID, eventData, client.username)
}

func (h *DefaultMessageHandler) handleGetListeners(client *Client) {
	if client.musicID == nil {
		log.Printf("Client not in a session")
		return
	}

	listeners, err := h.sessionManager.GetCurrentListeners(*client.musicID)
	if err != nil {
		log.Printf("Failed to get current listeners: %v", err)
		return
	}

	response := BaseEvent{
		Type: EventTypeCurrentListeners,
		Payload: ListenersPayload{
			Listeners: listeners,
		},
	}

	data, err := json.Marshal(response)
	if err != nil {
		log.Printf("Failed to marshal current listeners response: %v", err)
		return
	}

	client.Send(data)
}

func (h *DefaultMessageHandler) handleProgress(client *Client, payload interface{}) {
	var data ProgressPayload
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Failed to marshal payload: %v", err)
		return
	}

	if err := json.Unmarshal(payloadBytes, &data); err != nil {
		log.Printf("Failed to unmarshal progress payload: %v", err)
		return
	}

	if err := h.sessionManager.UpdatePosition(client.username, *client.musicID, data.Position); err != nil {
		log.Printf("Failed to update position: %v", err)
		return
	}

	event := BaseEvent{
		Type: EventTypeProgress,
		Payload: UserPositionEventPayload{
			Username: client.username,
			Position: data.Position,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal progress event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData, client.username)
}

func (h *DefaultMessageHandler) handleSeek(client *Client, payload interface{}) {
	var data ProgressPayload
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Failed to marshal payload: %v", err)
		return
	}

	if err := json.Unmarshal(payloadBytes, &data); err != nil {
		log.Printf("Failed to unmarshal seek payload: %v", err)
		return
	}

	if err := h.sessionManager.UpdatePosition(client.username, *client.musicID, data.Position); err != nil {
		log.Printf("Failed to update position: %v", err)
		return
	}

	event := BaseEvent{
		Type: EventTypeSeek,
		Payload: UserPositionEventPayload{
			Username: client.username,
			Position: data.Position,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal seek event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData, client.username)
}

func (h *DefaultMessageHandler) handlePause(client *Client) {
	event := BaseEvent{
		Type: EventTypePause,
		Payload: UserEventPayload{
			Username: client.username,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal pause event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData, client.username)
}

func (h *DefaultMessageHandler) handleResume(client *Client) {
	event := BaseEvent{
		Type: EventTypeResume,
		Payload: UserEventPayload{
			Username: client.username,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal resume event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData, client.username)
}

func (h *DefaultMessageHandler) handleChatMessage(client *Client, payload interface{}) {
	var data ChatMessagePayload
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Failed to marshal payload: %v", err)
		return
	}

	if err := json.Unmarshal(payloadBytes, &data); err != nil {
		log.Printf("Failed to unmarshal chat message payload: %v", err)
		return
	}

	user, err := h.usersRepository.FindByUsername(client.username)
	if err != nil {
		log.Printf("Failed to get user: %v", err)
		return
	}

	event := BaseEvent{
		Type: EventTypeChatMessage,
		Payload: ChatMessagePayload{
			Username:       client.username,
			Name:           user.Name,
			ProfilePicture: user.ProfilePicture,
			Message:        data.Message,
			Timestamp:      time.Now().UnixMilli(),
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal chat message event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData, client.username)
}
