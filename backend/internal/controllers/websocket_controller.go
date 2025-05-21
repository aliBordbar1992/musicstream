package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // TODO: Implement proper origin checking
	},
}

// WebSocketController handles WebSocket connections and real-time communication
type WebSocketController struct {
	listenerService domain.ListenerService
	clients         map[string]*Client
	mu              sync.RWMutex
}

// Client represents a connected WebSocket client
type Client struct {
	conn     *websocket.Conn
	username string
	musicID  uint
	send     chan []byte
}

// NewWebSocketController creates a new instance of WebSocketController
func NewWebSocketController(listenerService domain.ListenerService) *WebSocketController {
	return &WebSocketController{
		listenerService: listenerService,
		clients:         make(map[string]*Client),
	}
}

// HandleWebSocket handles WebSocket connections
func (c *WebSocketController) HandleWebSocket(ctx *gin.Context) {
	username, err := utils.ValidateTokenAndGetUsername(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	musicID := ctx.Query("music_id")
	if musicID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "music_id is required"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	client := &Client{
		conn:     conn,
		username: username,
		musicID:  uint(parseUint(musicID)),
		send:     make(chan []byte, 256),
	}

	// Register client
	c.mu.Lock()
	c.clients[username] = client
	c.mu.Unlock()

	// Start listening to this music
	if err := c.listenerService.StartListening(username, client.musicID); err != nil {
		log.Printf("Failed to start listening: %v", err)
		conn.Close()
		return
	}

	// Broadcast user joined event
	c.broadcastUserJoined(username, client.musicID)

	// Start goroutines for reading and writing
	go c.readPump(client)
	go c.writePump(client)
}

// readPump pumps messages from the WebSocket connection to the hub
func (c *WebSocketController) readPump(client *Client) {
	defer func() {
		c.unregister(client)
		client.conn.Close()
	}()

	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var event struct {
			Type    string          `json:"t"`
			Payload json.RawMessage `json:"p"`
		}

		if err := json.Unmarshal(message, &event); err != nil {
			log.Printf("Failed to unmarshal event: %v", err)
			continue
		}

		switch event.Type {
		case "progress":
			var payload struct {
				Position float64 `json:"p"`
			}
			if err := json.Unmarshal(event.Payload, &payload); err != nil {
				log.Printf("Failed to unmarshal progress payload: %v", err)
				continue
			}
			c.handleProgress(client, payload.Position)
		case "seek":
			var payload struct {
				Position float64 `json:"p"`
			}
			if err := json.Unmarshal(event.Payload, &payload); err != nil {
				log.Printf("Failed to unmarshal seek payload: %v", err)
				continue
			}
			c.handleSeek(client, payload.Position)
		case "pause":
			c.handlePause(client)
		case "resume":
			c.handleResume(client)
		}
	}
}

// writePump pumps messages from the hub to the WebSocket connection
func (c *WebSocketController) writePump(client *Client) {
	defer func() {
		client.conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.send:
			if !ok {
				client.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current websocket message
			n := len(client.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-client.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}

// unregister removes a client from the controller
func (c *WebSocketController) unregister(client *Client) {
	c.mu.Lock()
	delete(c.clients, client.username)
	c.mu.Unlock()

	// Stop listening
	if err := c.listenerService.StopListening(client.username, client.musicID); err != nil {
		log.Printf("Failed to stop listening: %v", err)
	}

	// Broadcast user left event
	c.broadcastUserLeft(client.username, client.musicID)
}

// broadcastUserJoined notifies all clients when a user joins
func (c *WebSocketController) broadcastUserJoined(username string, musicID uint) {
	event := struct {
		Type    string `json:"t"`
		Payload struct {
			Username string `json:"u"`
		} `json:"p"`
	}{
		Type: "user_joined",
		Payload: struct {
			Username string `json:"u"`
		}{
			Username: username,
		},
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal user joined event: %v", err)
		return
	}

	c.broadcastToMusic(musicID, data)
}

// broadcastUserLeft notifies all clients when a user leaves
func (c *WebSocketController) broadcastUserLeft(username string, musicID uint) {
	event := struct {
		Type    string `json:"t"`
		Payload struct {
			Username string `json:"u"`
		} `json:"p"`
	}{
		Type: "user_left",
		Payload: struct {
			Username string `json:"u"`
		}{
			Username: username,
		},
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal user left event: %v", err)
		return
	}

	c.broadcastToMusic(musicID, data)
}

// broadcastToMusic sends a message to all clients listening to a specific music
func (c *WebSocketController) broadcastToMusic(musicID uint, message []byte) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	for _, client := range c.clients {
		if client.musicID == musicID {
			select {
			case client.send <- message:
			default:
				close(client.send)
				delete(c.clients, client.username)
			}
		}
	}
}

// handleProgress handles playback progress updates
func (c *WebSocketController) handleProgress(client *Client, position float64) {
	if err := c.listenerService.UpdatePosition(client.username, client.musicID, position); err != nil {
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
			Position: position,
		},
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal progress event: %v", err)
		return
	}

	c.broadcastToMusic(client.musicID, data)
}

// handleSeek handles seek events
func (c *WebSocketController) handleSeek(client *Client, position float64) {
	if err := c.listenerService.UpdatePosition(client.username, client.musicID, position); err != nil {
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
			Position: position,
		},
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal seek event: %v", err)
		return
	}

	c.broadcastToMusic(client.musicID, data)
}

// handlePause handles pause events
func (c *WebSocketController) handlePause(client *Client) {
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

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal pause event: %v", err)
		return
	}

	c.broadcastToMusic(client.musicID, data)
}

// handleResume handles resume events
func (c *WebSocketController) handleResume(client *Client) {
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

	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal resume event: %v", err)
		return
	}

	c.broadcastToMusic(client.musicID, data)
}
