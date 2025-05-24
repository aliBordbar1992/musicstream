package services

import (
	"fmt"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
)

type listenerService struct {
	cacheService domain.CacheService
}

// NewListenerService creates a new instance of ListenerService
func NewListenerService(cacheService domain.CacheService) domain.ListenerService {
	return &listenerService{
		cacheService: cacheService,
	}
}

// generateCurrentlyListeningKey generates a Redis key for the currently listening user
func (s *listenerService) generateCurrentlyListeningKey(username string) string {
	return fmt.Sprintf("musicstream:currently_listening:%s", username)
}

// generateMusicListenerKey generates a Redis key for a listener
func (s *listenerService) generateMusicListenerKey(musicID uint, username string) string {
	return fmt.Sprintf("musicstream:music:%d:listener:%s", musicID, username)
}

// generateMusicListenersKey generates a Redis key for all listeners of a music
func (s *listenerService) generateMusicListenersKey(musicID uint) string {
	return fmt.Sprintf("musicstream:music:%d:listeners", musicID)
}

func (s *listenerService) StartListening(username string, musicID uint) error {
	// First, get existing listeners
	listenersKey := s.generateMusicListenersKey(musicID)
	var listeners []*domain.Listener
	if exists, _ := s.cacheService.Exists(listenersKey); exists {
		if err := s.cacheService.Get(listenersKey, &listeners); err != nil {
			return err
		}
	}

	// Create new listener
	listener := &domain.Listener{
		Username:  username,
		MusicID:   musicID,
		Position:  0,
		UpdatedAt: time.Now(),
	}

	// Store individual listener
	key := s.generateMusicListenerKey(musicID, username)
	if err := s.cacheService.Set(key, listener, 24*time.Hour); err != nil {
		return err
	}

	// Add to music's listeners set if not present
	for _, l := range listeners {
		if l.Username == username {
			return nil
		}
	}

	listeners = append(listeners, listener)

	// Store currently listening user
	currentlyListeningKey := s.generateCurrentlyListeningKey(username)
	if err := s.cacheService.Set(currentlyListeningKey, listener, 24*time.Hour); err != nil {
		return err
	}

	return s.cacheService.Set(listenersKey, listeners, 24*time.Hour)
}

func (s *listenerService) UpdatePosition(username string, musicID uint, position float64) error {
	key := s.generateMusicListenerKey(musicID, username)
	var listener domain.Listener
	if err := s.cacheService.Get(key, &listener); err != nil {
		return err
	}

	listener.Position = position
	listener.UpdatedAt = time.Now()

	if err := s.cacheService.Set(key, listener, 24*time.Hour); err != nil {
		return err
	}

	// Update in listeners set
	listenersKey := s.generateMusicListenersKey(musicID)
	var listeners []*domain.Listener
	if err := s.cacheService.Get(listenersKey, &listeners); err != nil {
		return err
	}

	for i, l := range listeners {
		if l.Username == username {
			listeners[i] = &listener
			break
		}
	}

	return s.cacheService.Set(listenersKey, listeners, 24*time.Hour)
}

func (s *listenerService) StopListening(username string, musicID uint) error {
	key := s.generateMusicListenerKey(musicID, username)
	if err := s.cacheService.Delete(key); err != nil {
		return err
	}

	// Remove from listeners set
	listenersKey := s.generateMusicListenersKey(musicID)
	var listeners []*domain.Listener
	if err := s.cacheService.Get(listenersKey, &listeners); err != nil {
		return err
	}

	newListeners := make([]*domain.Listener, 0, len(listeners))
	for _, l := range listeners {
		if l.Username != username {
			newListeners = append(newListeners, l)
		}
	}

	return s.cacheService.Set(listenersKey, newListeners, 24*time.Hour)
}

func (s *listenerService) GetCurrentlyListeningUser(username string) (*domain.Listener, error) {
	currentlyListeningKey := s.generateCurrentlyListeningKey(username)
	var listener domain.Listener

	if err := s.cacheService.Get(currentlyListeningKey, &listener); err != nil {
		if err == domain.NilCache {
			return nil, nil
		}
		return nil, err
	}
	return &listener, nil
}

func (s *listenerService) GetCurrentListeners(musicID uint) ([]*domain.Listener, error) {
	listenersKey := s.generateMusicListenersKey(musicID)
	var listeners []*domain.Listener
	if err := s.cacheService.Get(listenersKey, &listeners); err != nil {
		return nil, err
	}
	return listeners, nil
}

func (s *listenerService) GetListener(userID string, musicID uint) (*domain.Listener, error) {
	key := s.generateMusicListenerKey(musicID, userID)
	var listener domain.Listener
	if err := s.cacheService.Get(key, &listener); err != nil {
		return nil, err
	}
	return &listener, nil
}
