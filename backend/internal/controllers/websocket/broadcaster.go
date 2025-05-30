package websocket

import (
	"encoding/json"
	"log"
	"sync"
)

// Broadcaster handles message broadcasting to clients
type Broadcaster struct {
	clients map[string]*Client
	mu      sync.RWMutex
}

// NewBroadcaster creates a new broadcaster
func NewBroadcaster() *Broadcaster {
	return &Broadcaster{
		clients: make(map[string]*Client),
	}
}

// Register adds a client to the broadcaster
func (b *Broadcaster) Register(client *Client) {
	b.mu.Lock()
	b.clients[client.username] = client
	b.mu.Unlock()
}

// Unregister removes a client from the broadcaster
func (b *Broadcaster) Unregister(username string) {
	b.mu.Lock()
	delete(b.clients, username)
	b.mu.Unlock()
}

// BroadcastToMusic sends a message to all clients listening to a specific music except the sender
func (b *Broadcaster) BroadcastToMusic(musicID uint, message []byte, sender string) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	for username, client := range b.clients {
		if client.musicID != nil && *client.musicID == musicID && username != sender {
			client.Send(message)
		}
	}
}

// BroadcastUserJoined notifies all clients when a user joins
func (b *Broadcaster) BroadcastUserJoined(username string, musicID uint) {
	event := BaseEvent{
		Type: EventTypeUserJoined,
		Payload: UserEventPayload{
			Username: username,
		},
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal user joined event: %v", err)
		return
	}

	b.BroadcastToMusic(musicID, data, username)
}

// BroadcastUserLeft notifies all clients when a user leaves
func (b *Broadcaster) BroadcastUserLeft(username string, musicID uint) {
	event := BaseEvent{
		Type: EventTypeUserLeft,
		Payload: UserEventPayload{
			Username: username,
		},
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal user left event: %v", err)
		return
	}

	b.BroadcastToMusic(musicID, data, username)
}
