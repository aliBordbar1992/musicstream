package domain

import "time"

// Session represents a user session in the system
type Session struct {
	Token     string    `json:"token"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

// SessionRepository defines the interface for session data operations
type SessionRepository interface {
	Create(session *Session) error
	FindByToken(token string) (*Session, error)
	DeleteByUsername(username string) error
}
