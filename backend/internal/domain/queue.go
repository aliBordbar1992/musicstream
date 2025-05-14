package domain

import (
	"time"

	"gorm.io/gorm"
)

// Queue represents a user's music queue
type Queue struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"not null"`
	UserID    string         `json:"user_id" gorm:"not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Items     []QueueItem    `json:"items" gorm:"foreignKey:QueueID"`
}

// QueueItem represents an item in a queue
type QueueItem struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	QueueID   uint           `json:"queue_id" gorm:"not null"`
	MusicID   uint           `json:"music_id" gorm:"not null"`
	Music     *Music         `json:"music" gorm:"foreignKey:MusicID"`
	Position  int            `json:"position" gorm:"not null"`
	Type      string         `json:"type" gorm:"not null"` // "next" or "queue"
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// QueueRepository defines the interface for queue data operations
type QueueRepository interface {
	Create(queue *Queue) error
	FindByUserID(userID string) (*Queue, error)
	AddItem(item *QueueItem) error
	RemoveItem(queueID, musicID uint) error
	GetItems(queueID uint) ([]*QueueItem, error)
	UpdateItemPosition(queueID, musicID uint, newPosition int) error
}

// QueueService defines the interface for queue business logic
type QueueService interface {
	CreateQueue(name, userID string) (*Queue, error)
	GetUserQueue(userID string) (*Queue, error)
	AddToQueue(queueID, musicID uint, position int) error
	AddToNext(queueID, musicID uint) error
	RemoveFromQueue(queueID, musicID uint) error
	GetQueueItems(queueID uint) ([]*QueueItem, error)
	MoveItem(queueID, musicID uint, newPosition int) error
}
