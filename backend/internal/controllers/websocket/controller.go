package websocket

import (
	"log"
	"net/http"
	"time"

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
	broadcaster     *Broadcaster
	messageHandler  MessageHandler
}

// NewWebSocketController creates a new instance of WebSocketController
func NewWebSocketController(listenerService domain.ListenerService) *WebSocketController {
	broadcaster := NewBroadcaster()
	controller := &WebSocketController{
		listenerService: listenerService,
		broadcaster:     broadcaster,
	}

	// Create and configure message handler
	controller.messageHandler = NewDefaultMessageHandler(controller)

	return controller
}

// HandleWebSocket handles WebSocket connections
func (c *WebSocketController) HandleWebSocket(ctx *gin.Context) {
	username, err := utils.ValidateTokenAndGetUsername(ctx)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	client := NewClient(conn, username)
	c.broadcaster.Register(client)

	// Start goroutines for reading and writing
	go c.readPump(client)
	go c.writePump(client)
}

// readPump pumps messages from the WebSocket connection to the hub
func (c *WebSocketController) readPump(client *Client) {
	defer func() {
		log.Println("Unregistering client")
		c.unregister(client)
	}()

	// Set read deadline and pong handler
	client.conn.SetReadLimit(512) // Limit message size
	client.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	client.conn.SetPongHandler(func(string) error {
		client.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Unexpected close error: %v", err)
			} else if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				log.Printf("Normal closure: %v", err)
			} else {
				log.Printf("Read error: %v", err)
			}
			break
		}

		// Reset read deadline after successful read
		client.conn.SetReadDeadline(time.Now().Add(60 * time.Second))

		c.messageHandler.HandleMessage(client, message)
	}
	log.Println("Read pump finished")
}

// writePump pumps messages from the hub to the WebSocket connection
func (c *WebSocketController) writePump(client *Client) {
	if client == nil {
		return
	}

	// Set up ping ticker
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		log.Println("Closing client")
		client.Close() // Only close once here
	}()

	for {
		select {
		case message, ok := <-client.send:
			if !ok {
				// Channel was closed
				client.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
				return
			}

			w, err := client.NextWriter(websocket.TextMessage)
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

		case <-ticker.C:
			if err := client.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// unregister removes a client from the controller
func (c *WebSocketController) unregister(client *Client) {
	c.broadcaster.Unregister(client.username)

	// If client was in a session, leave it
	if client.musicID != nil {
		c.listenerService.StopListening(client.username, *client.musicID)
	}
}

// SessionManager interface implementation
func (c *WebSocketController) JoinSession(username string, musicID uint) error {
	/* // get currently listening user
	currentlyListeningUser, err := c.listenerService.GetCurrentlyListeningUser(username)
	if err != nil {
		return err
	}

	// if currently listening user is not nil, stop listening to the music track
	if currentlyListeningUser != nil {
		log.Println("Stopping listening to the music track")
		c.listenerService.StopListening(username, currentlyListeningUser.MusicID)
	} */

	return c.listenerService.StartListening(username, musicID)
}

func (c *WebSocketController) LeaveSession(username string, musicID uint) error {
	return c.listenerService.StopListening(username, musicID)
}

func (c *WebSocketController) GetCurrentListeners(musicID uint) ([]*domain.Listener, error) {
	return c.listenerService.GetCurrentListeners(musicID)
}

func (c *WebSocketController) UpdatePosition(username string, musicID uint, position float64) error {
	return c.listenerService.UpdatePosition(username, musicID, position)
}

func (c *WebSocketController) BroadcastToMusic(musicID uint, message []byte, sender string) {
	c.broadcaster.BroadcastToMusic(musicID, message, sender)
}
