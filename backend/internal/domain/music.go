package domain

import (
	"time"

	"gorm.io/gorm"
)

// Music represents a music track in the system
type Music struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	Title      string         `json:"title"`
	ArtistID   uint           `json:"artist_id" gorm:"not null"`
	Artist     *Artist        `json:"artist" gorm:"foreignKey:ArtistID"`
	Album      string         `json:"album"`
	FilePath   string         `json:"file_path"`
	UploadedBy string         `json:"uploaded_by"`
	Duration   float64        `json:"duration"` // Duration in seconds
	CreatedAt  time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for the Music model
func (Music) TableName() string {
	return "musics"
}

// MusicRepository defines the interface for music data operations
type MusicRepository interface {
	Create(music *Music) error
	FindByID(id uint) (*Music, error)
	FindAll() ([]*Music, error)
	Delete(id uint) error
	FindByUploader(username string) ([]*Music, error)
	FindByArtist(artistID uint) ([]*Music, error)
	GetFilePath(id uint) (string, error)
}

// MusicService defines the interface for music business logic
type MusicService interface {
	UploadMusic(title string, artistID uint, album, filePath, username string, duration float64) (*Music, error)
	GetMusic(id uint) (*Music, error)
	ListAllMusic() ([]*Music, error)
	DeleteMusic(id uint) error
	GetUserMusic(username string) ([]*Music, error)
	GetMusicByArtist(artistID uint) ([]*Music, error)
}
