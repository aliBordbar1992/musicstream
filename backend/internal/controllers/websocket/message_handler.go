package websocket

import (
	"encoding/json"
	"log"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
)

// SessionManager defines the interface for managing WebSocket sessions
type SessionManager interface {
	JoinSession(username string, musicID uint) error
	LeaveSession(username string, musicID uint) error
	GetCurrentListeners(musicID uint) ([]*domain.Listener, error)
	UpdatePosition(username string, musicID uint, position float64) error
	BroadcastToMusic(musicID uint, message []byte)
}

// MessageHandler defines the interface for handling WebSocket messages
type MessageHandler interface {
	HandleMessage(client *Client, message []byte)
}

// DefaultMessageHandler implements the MessageHandler interface
type DefaultMessageHandler struct {
	sessionManager SessionManager
}

// NewDefaultMessageHandler creates a new message handler
func NewDefaultMessageHandler(sessionManager SessionManager) *DefaultMessageHandler {
	return &DefaultMessageHandler{
		sessionManager: sessionManager,
	}
}

// HandleMessage processes incoming WebSocket messages
func (h *DefaultMessageHandler) HandleMessage(client *Client, message []byte) {
	var event struct {
		Type    string          `json:"t"`
		Payload json.RawMessage `json:"p"`
	}

	if err := json.Unmarshal(message, &event); err != nil {
		log.Printf("Failed to unmarshal event: %v", err)
		return
	}

	if event.Type == "join_session" {
		h.handleJoinSession(client, event.Payload)
		return
	}

	// For all other messages, require client to be in a session
	if client.musicID == nil {
		log.Printf("Client %s not in a session, ignoring %s request", client.username, event.Type)
		return
	}

	switch event.Type {
	case "leave_session":
		h.handleLeaveSession(client)
	case "get_listeners":
		h.handleGetListeners(client)
	case "progress":
		h.handleProgress(client, event.Payload)
	case "seek":
		h.handleSeek(client, event.Payload)
	case "pause":
		h.handlePause(client)
	case "resume":
		h.handleResume(client)
	default:
		log.Printf("Unknown message type: %s", event.Type)
	}
}

func (h *DefaultMessageHandler) handleJoinSession(client *Client, payload json.RawMessage) {
	log.Println("handling join session message", client.username, payload)
	var data struct {
		MusicID uint `json:"music_id"`
	}
	if err := json.Unmarshal(payload, &data); err != nil {
		log.Printf("Failed to unmarshal join session payload: %v", err)
		return
	}

	if err := h.sessionManager.JoinSession(client.username, data.MusicID); err != nil {
		log.Printf("Failed to join session: %v", err)
		return
	}

	client.musicID = &data.MusicID
}

func (h *DefaultMessageHandler) handleLeaveSession(client *Client) {
	if client.musicID == nil {
		return
	}

	if err := h.sessionManager.LeaveSession(client.username, *client.musicID); err != nil {
		log.Printf("Failed to leave session: %v", err)
	}

	client.musicID = nil
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

	response := struct {
		Type    string `json:"t"`
		Payload struct {
			Listeners []*domain.Listener `json:"l"`
		} `json:"p"`
	}{
		Type: "current_listeners",
		Payload: struct {
			Listeners []*domain.Listener `json:"l"`
		}{
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

func (h *DefaultMessageHandler) handleProgress(client *Client, payload json.RawMessage) {
	var data struct {
		Position float64 `json:"p"`
	}
	if err := json.Unmarshal(payload, &data); err != nil {
		log.Printf("Failed to unmarshal progress payload: %v", err)
		return
	}

	if err := h.sessionManager.UpdatePosition(client.username, *client.musicID, data.Position); err != nil {
		log.Printf("Failed to update position: %v", err)
		return
	}

	event := struct {
		Type    string `json:"t"`
		Payload struct {
			Username string  `json:"u"`
			Position float64 `json:"p"`
		} `json:"p"`
	}{
		Type: "progress",
		Payload: struct {
			Username string  `json:"u"`
			Position float64 `json:"p"`
		}{
			Username: client.username,
			Position: data.Position,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal progress event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData)
}

func (h *DefaultMessageHandler) handleSeek(client *Client, payload json.RawMessage) {
	var data struct {
		Position float64 `json:"p"`
	}
	if err := json.Unmarshal(payload, &data); err != nil {
		log.Printf("Failed to unmarshal seek payload: %v", err)
		return
	}

	if err := h.sessionManager.UpdatePosition(client.username, *client.musicID, data.Position); err != nil {
		log.Printf("Failed to update position: %v", err)
		return
	}

	event := struct {
		Type    string `json:"t"`
		Payload struct {
			Username string  `json:"u"`
			Position float64 `json:"p"`
		} `json:"p"`
	}{
		Type: "seek",
		Payload: struct {
			Username string  `json:"u"`
			Position float64 `json:"p"`
		}{
			Username: client.username,
			Position: data.Position,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal seek event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData)
}

func (h *DefaultMessageHandler) handlePause(client *Client) {
	event := struct {
		Type    string `json:"t"`
		Payload struct {
			Username string `json:"u"`
		} `json:"p"`
	}{
		Type: "pause",
		Payload: struct {
			Username string `json:"u"`
		}{
			Username: client.username,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal pause event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData)
}

func (h *DefaultMessageHandler) handleResume(client *Client) {
	event := struct {
		Type    string `json:"t"`
		Payload struct {
			Username string `json:"u"`
		} `json:"p"`
	}{
		Type: "resume",
		Payload: struct {
			Username string `json:"u"`
		}{
			Username: client.username,
		},
	}

	eventData, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal resume event: %v", err)
		return
	}

	h.sessionManager.BroadcastToMusic(*client.musicID, eventData)
}
