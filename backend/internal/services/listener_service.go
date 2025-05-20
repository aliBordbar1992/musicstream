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

// generateKey generates a Redis key for a listener
func (s *listenerService) generateKey(musicID uint, username string) string {
	return fmt.Sprintf("musicstream:music:%d:listener:%s", musicID, username)
}

// generateListenersKey generates a Redis key for all listeners of a music
func (s *listenerService) generateListenersKey(musicID uint) string {
	return fmt.Sprintf("musicstream:music:%d:listeners", musicID)
}

func (s *listenerService) StartListening(username string, musicID uint) error {
	listener := &domain.Listener{
		Username:  username,
		MusicID:   musicID,
		Position:  0,
		UpdatedAt: time.Now(),
	}

	// Store individual listener
	key := s.generateKey(musicID, username)
	if err := s.cacheService.Set(key, listener, 24*time.Hour); err != nil {
		return err
	}

	// Add to music's listeners set
	listenersKey := s.generateListenersKey(musicID)
	var listeners []*domain.Listener
	if exists, _ := s.cacheService.Exists(listenersKey); exists {
		if err := s.cacheService.Get(listenersKey, &listeners); err != nil {
			return err
		}
	}
	listeners = append(listeners, listener)
	return s.cacheService.Set(listenersKey, listeners, 24*time.Hour)
}

func (s *listenerService) UpdatePosition(username string, musicID uint, position float64) error {
	key := s.generateKey(musicID, username)
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
	listenersKey := s.generateListenersKey(musicID)
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
	key := s.generateKey(musicID, username)
	if err := s.cacheService.Delete(key); err != nil {
		return err
	}

	// Remove from listeners set
	listenersKey := s.generateListenersKey(musicID)
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

func (s *listenerService) GetCurrentListeners(musicID uint) ([]*domain.Listener, error) {
	listenersKey := s.generateListenersKey(musicID)
	var listeners []*domain.Listener
	if err := s.cacheService.Get(listenersKey, &listeners); err != nil {
		return nil, err
	}
	return listeners, nil
}

func (s *listenerService) GetListener(userID string, musicID uint) (*domain.Listener, error) {
	key := s.generateKey(musicID, userID)
	var listener domain.Listener
	if err := s.cacheService.Get(key, &listener); err != nil {
		return nil, err
	}
	return &listener, nil
}
