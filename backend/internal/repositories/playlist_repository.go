package repositories

import (
	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"gorm.io/gorm"
)

type playlistRepository struct {
	db *gorm.DB
}

// NewPlaylistRepository creates a new instance of PlaylistRepository
func NewPlaylistRepository(db *gorm.DB) domain.PlaylistRepository {
	return &playlistRepository{db: db}
}

func (r *playlistRepository) Create(playlist *domain.Playlist) error {
	return r.db.Create(playlist).Error
}

func (r *playlistRepository) FindByID(id uint) (*domain.Playlist, error) {
	var playlist domain.Playlist
	err := r.db.First(&playlist, id).Error
	if err != nil {
		return nil, err
	}
	return &playlist, nil
}

func (r *playlistRepository) FindByCreator(username string) ([]*domain.Playlist, error) {
	var playlists []*domain.Playlist
	err := r.db.Where("created_by = ?", username).Find(&playlists).Error
	if err != nil {
		return nil, err
	}
	return playlists, nil
}

func (r *playlistRepository) Delete(id uint) error {
	// First delete all songs in the playlist
	if err := r.db.Where("playlist_id = ?", id).Delete(&domain.PlaylistMusic{}).Error; err != nil {
		return err
	}
	// Then delete the playlist
	return r.db.Delete(&domain.Playlist{}, id).Error
}

func (r *playlistRepository) AddSong(playlistID, musicID uint) error {
	playlistMusic := domain.PlaylistMusic{
		PlaylistID: playlistID,
		MusicID:    musicID,
	}
	return r.db.Create(&playlistMusic).Error
}

func (r *playlistRepository) RemoveSong(playlistID, musicID uint) error {
	return r.db.Where("playlist_id = ? AND music_id = ?", playlistID, musicID).
		Delete(&domain.PlaylistMusic{}).Error
}

func (r *playlistRepository) GetSongs(playlistID uint) ([]*domain.Music, error) {
	var songs []*domain.Music
	err := r.db.Joins("JOIN playlist_musics ON playlist_musics.music_id = musics.id").
		Where("playlist_musics.playlist_id = ?", playlistID).
		Preload("Artist").
		Find(&songs).Error
	if err != nil {
		return nil, err
	}
	return songs, nil
}
