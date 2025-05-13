package domain

import (
	"time"

	"gorm.io/gorm"
)

// Artist represents an artist in the system
type Artist struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"uniqueIndex;not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the Artist model
func (Artist) TableName() string {
	return "artists"
}

// ArtistRepository defines the interface for artist data operations
type ArtistRepository interface {
	Create(artist *Artist) error
	FindByID(id uint) (*Artist, error)
	FindByName(name string) (*Artist, error)
	Search(query string) ([]*Artist, error)
	FindAll() ([]*Artist, error)
}

// ArtistService defines the interface for artist business logic
type ArtistService interface {
	CreateArtist(name string) (*Artist, error)
	GetArtist(id uint) (*Artist, error)
	SearchArtists(query string) ([]*Artist, error)
	GetOrCreateArtist(name string) (*Artist, error)
}
