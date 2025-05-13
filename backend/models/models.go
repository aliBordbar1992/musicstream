package models

import (
	"time"
)

type User struct {
	Username string `gorm:"primaryKey"`
	Password string
}

type Session struct {
	Token     string `gorm:"primaryKey"`
	Username  string
	CreatedAt time.Time
}

type Music struct {
	ID         uint `gorm:"primaryKey"`
	Title      string
	Artist     string
	Album      string
	FilePath   string
	UploadedBy string
	CreatedAt  time.Time
}

type Playlist struct {
	ID        uint `gorm:"primaryKey"`
	Name      string
	CreatedBy string
	CreatedAt time.Time
}

type PlaylistMusic struct {
	PlaylistID uint `gorm:"primaryKey"`
	MusicID    uint `gorm:"primaryKey"`
}
