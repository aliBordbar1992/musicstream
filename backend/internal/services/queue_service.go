package services

import (
	"errors"
	"math/rand"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
)

type queueService struct {
	queueRepo domain.QueueRepository
	musicRepo domain.MusicRepository
}

// NewQueueService creates a new instance of QueueService
func NewQueueService(queueRepo domain.QueueRepository, musicRepo domain.MusicRepository) domain.QueueService {
	return &queueService{
		queueRepo: queueRepo,
		musicRepo: musicRepo,
	}
}

func (s *queueService) CreateQueue(name, userID string) (*domain.Queue, error) {
	// Create new queue
	queue := &domain.Queue{
		Name:   name,
		UserID: userID,
	}

	if err := s.queueRepo.Create(queue); err != nil {
		return nil, err
	}

	// Get all available songs
	songs, err := s.musicRepo.FindAll()
	if err != nil {
		return nil, err
	}

	// Shuffle songs
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(songs), func(i, j int) {
		songs[i], songs[j] = songs[j], songs[i]
	})

	// Add songs to queue
	for i, song := range songs {
		queueItem := &domain.QueueItem{
			QueueID:  queue.ID,
			MusicID:  song.ID,
			Position: i,
			Type:     "queue",
		}
		if err := s.queueRepo.AddItem(queueItem); err != nil {
			return nil, err
		}
	}

	return queue, nil
}

func (s *queueService) GetUserQueue(userID string) (*domain.Queue, error) {
	return s.queueRepo.FindByUserID(userID)
}

func (s *queueService) AddToQueue(queueID, musicID uint, position int) error {
	// Verify music exists
	_, err := s.musicRepo.FindByID(musicID)
	if err != nil {
		return errors.New("music not found")
	}

	queueItem := &domain.QueueItem{
		QueueID:  queueID,
		MusicID:  musicID,
		Position: position,
		Type:     "queue",
	}

	return s.queueRepo.AddItem(queueItem)
}

func (s *queueService) AddToNext(queueID, musicID uint) error {
	// Verify music exists
	_, err := s.musicRepo.FindByID(musicID)
	if err != nil {
		return errors.New("music not found")
	}

	// Get the highest position of "next" type items
	items, err := s.queueRepo.GetItems(queueID)
	if err != nil {
		return err
	}

	maxNextPosition := 0
	for _, item := range items {
		if item.Type == "next" && item.Position > maxNextPosition {
			maxNextPosition = item.Position
		}
	}

	queueItem := &domain.QueueItem{
		QueueID:  queueID,
		MusicID:  musicID,
		Position: maxNextPosition + 1,
		Type:     "next",
	}

	return s.queueRepo.AddItem(queueItem)
}

func (s *queueService) RemoveFromQueue(queueID, musicID uint) error {
	return s.queueRepo.RemoveItem(queueID, musicID)
}

func (s *queueService) GetQueueItems(queueID uint) ([]*domain.QueueItem, error) {
	return s.queueRepo.GetItems(queueID)
}

func (s *queueService) MoveItem(queueID, musicID uint, newPosition int) error {
	return s.queueRepo.UpdateItemPosition(queueID, musicID, newPosition)
}
