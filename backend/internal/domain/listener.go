package domain

import (
	"time"
)

// Listener represents a user listening to a music track
type Listener struct {
	Username       string  `json:"u"`
	Name           *string `json:"n"`  // nullable
	ProfilePicture *string `json:"pp"` // nullable
	MusicID        uint    `json:"m"`
	Position       float64 `json:"p"`
}

type CacheError string

func (e CacheError) Error() string { return string(e) }

func (CacheError) CacheError() {}

const NilCache = CacheError("cache: nil")

// CacheService defines the interface for caching operations
type CacheService interface {
	// Set stores a value in the cache with an optional expiration time
	Set(key string, value interface{}, expiration time.Duration) error
	// Get retrieves a value from the cache
	// if the key does not exist, it returns domain.NilCache error
	Get(key string, dest interface{}) error
	// Delete removes a value from the cache
	Delete(key string) error
	// Exists checks if a key exists in the cache
	Exists(key string) (bool, error)
}

// ListenerService defines the interface for listener business logic
type ListenerService interface {
	// StartListening marks a user as listening to a music track
	StartListening(username string, musicID uint) error
	// UpdatePosition updates a listener's position in a music track
	UpdatePosition(username string, musicID uint, position float64) error
	// StopListening removes a user from the listeners of a music track
	StopListening(username string, musicID uint) error
	// GetCurrentlyListeningUser returns the currently playing music track for a user
	GetCurrentlyListeningUser(username string) (*Listener, error)
	// GetCurrentListeners returns all current listeners for a music track
	GetCurrentListeners(musicID uint) ([]*Listener, error)
	// GetListener returns a specific listener's information
	GetListener(username string, musicID uint) (*Listener, error)
}
