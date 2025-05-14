package domain

import "time"

// Playlist represents a music playlist in the system
type Playlist struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	Songs     []*Music  `json:"songs,omitempty" gorm:"many2many:playlist_musics;"`
	IsOwner   bool      `json:"is_owner" gorm:"-"` // Indicates if the requesting user is the owner
}

// PlaylistMusic represents the relationship between playlists and music
type PlaylistMusic struct {
	PlaylistID uint `json:"playlist_id" gorm:"primaryKey"`
	MusicID    uint `json:"music_id" gorm:"primaryKey"`
}

// PlaylistRepository defines the interface for playlist data operations
type PlaylistRepository interface {
	Create(playlist *Playlist) error
	FindByID(id uint) (*Playlist, error)
	FindByCreator(username string) ([]*Playlist, error)
	Delete(id uint) error
	AddSong(playlistID, musicID uint) error
	RemoveSong(playlistID, musicID uint) error
	GetSongs(playlistID uint) ([]*Music, error)
}

// PlaylistService defines the interface for playlist business logic
type PlaylistService interface {
	CreatePlaylist(name, username string) (*Playlist, error)
	GetPlaylist(id uint, username string) (*Playlist, error)
	ListUserPlaylists(username string) ([]*Playlist, error)
	DeletePlaylist(id uint, username string) error
	AddSongToPlaylist(playlistID, musicID uint, username string) error
	RemoveSongFromPlaylist(playlistID, musicID uint, username string) error
	GetPlaylistSongs(playlistID uint, username string) ([]*Music, error)
}
