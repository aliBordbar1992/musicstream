package websocket

import (
	"io"
	"log"

	"github.com/gorilla/websocket"
)

// Client represents a connected WebSocket client
type Client struct {
	conn     *websocket.Conn
	username string
	musicID  *uint // Changed to pointer to allow nil value
	send     chan []byte
}

// NewClient creates a new WebSocket client
func NewClient(conn *websocket.Conn, username string) *Client {
	return &Client{
		conn:     conn,
		username: username,
		musicID:  nil,
		send:     make(chan []byte, 256),
	}
}

// Close closes the client's connection and channel
func (c *Client) Close() {
	if c == nil {
		return
	}

	log.Printf("Closing client for user %s", c.username)

	// Safely close the connection
	if c.conn != nil {
		// Send close message before closing
		c.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
		c.conn.Close()
		c.conn = nil
	}

	// Safely close the channel
	if c.send != nil {
		// Drain any remaining messages
		for range c.send {
			// Discard messages
		}
		close(c.send)
		c.send = nil
	}

	// Clear music ID
	c.musicID = nil
}

// Send sends a message to the client
func (c *Client) Send(message []byte) {
	if c == nil || c.send == nil {
		return
	}
	select {
	case c.send <- message:
	default:
		close(c.send)
	}
}

// IsConnected checks if the client is connected
func (c *Client) IsConnected() bool {
	return c != nil && c.conn != nil
}

// WriteMessage writes a message to the client's connection
func (c *Client) WriteMessage(messageType int, data []byte) error {
	if !c.IsConnected() {
		return websocket.ErrCloseSent
	}
	return c.conn.WriteMessage(messageType, data)
}

// NextWriter returns a writer for the next message
func (c *Client) NextWriter(messageType int) (io.WriteCloser, error) {
	if !c.IsConnected() {
		return nil, websocket.ErrCloseSent
	}
	return c.conn.NextWriter(messageType)
}
