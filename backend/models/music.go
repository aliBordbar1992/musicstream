package models

import (
	"time"

	"gorm.io/gorm"
)

type Music struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title" gorm:"not null"`
	ArtistID  uint           `json:"artist_id" gorm:"not null"`
	Artist    Artist         `json:"artist" gorm:"foreignKey:ArtistID"`
	Album     string         `json:"album"`
	Duration  int            `json:"duration"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
