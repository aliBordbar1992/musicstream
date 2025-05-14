package repositories

import (
	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"gorm.io/gorm"
)

type queueRepository struct {
	db *gorm.DB
}

// NewQueueRepository creates a new instance of QueueRepository
func NewQueueRepository(db *gorm.DB) domain.QueueRepository {
	return &queueRepository{db: db}
}

func (r *queueRepository) Create(queue *domain.Queue) error {
	return r.db.Create(queue).Error
}

func (r *queueRepository) FindByUserID(userID string) (*domain.Queue, error) {
	var queue domain.Queue
	err := r.db.Where("user_id = ?", userID).Preload("Items.Music").First(&queue).Error
	if err != nil {
		return nil, err
	}
	return &queue, nil
}

func (r *queueRepository) AddItem(item *domain.QueueItem) error {
	return r.db.Create(item).Error
}

func (r *queueRepository) RemoveItem(queueID, musicID uint) error {
	return r.db.Where("queue_id = ? AND music_id = ?", queueID, musicID).Delete(&domain.QueueItem{}).Error
}

func (r *queueRepository) GetItems(queueID uint) ([]*domain.QueueItem, error) {
	var items []*domain.QueueItem
	err := r.db.Where("queue_id = ?", queueID).Preload("Music").Find(&items).Error
	return items, err
}

func (r *queueRepository) UpdateItemPosition(queueID, musicID uint, newPosition int) error {
	return r.db.Model(&domain.QueueItem{}).
		Where("queue_id = ? AND music_id = ?", queueID, musicID).
		Update("position", newPosition).Error
}
