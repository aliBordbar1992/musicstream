package services

import (
	"errors"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
)

type playlistService struct {
	playlistRepo domain.PlaylistRepository
	musicRepo    domain.MusicRepository
}

// NewPlaylistService creates a new instance of PlaylistService
func NewPlaylistService(playlistRepo domain.PlaylistRepository, musicRepo domain.MusicRepository) domain.PlaylistService {
	return &playlistService{
		playlistRepo: playlistRepo,
		musicRepo:    musicRepo,
	}
}

func (s *playlistService) CreatePlaylist(name, username string) (*domain.Playlist, error) {
	playlist := &domain.Playlist{
		Name:      name,
		CreatedBy: username,
		CreatedAt: time.Now(),
		IsOwner:   true, // Creator is always the owner
	}

	if err := s.playlistRepo.Create(playlist); err != nil {
		return nil, err
	}

	return playlist, nil
}

func (s *playlistService) GetPlaylist(id uint, username string) (*domain.Playlist, error) {
	playlist, err := s.playlistRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	songs, err := s.playlistRepo.GetSongs(id)
	if err != nil {
		return nil, err
	}

	playlist.Songs = songs
	playlist.IsOwner = playlist.CreatedBy == username
	return playlist, nil
}

func (s *playlistService) ListUserPlaylists(username string) ([]*domain.Playlist, error) {
	playlists, err := s.playlistRepo.FindByCreator(username)
	if err != nil {
		return nil, err
	}

	// Set IsOwner to true for all playlists in the user's list
	for _, playlist := range playlists {
		playlist.IsOwner = true
	}

	return playlists, nil
}

func (s *playlistService) DeletePlaylist(id uint, username string) error {
	playlist, err := s.playlistRepo.FindByID(id)
	if err != nil {
		return err
	}

	// Check if the user is the owner of the playlist
	if playlist.CreatedBy != username {
		return errors.New("unauthorized: only playlist owner can delete the playlist")
	}

	return s.playlistRepo.Delete(id)
}

func (s *playlistService) AddSongToPlaylist(playlistID, musicID uint, username string) error {
	// Get playlist to check ownership
	playlist, err := s.playlistRepo.FindByID(playlistID)
	if err != nil {
		return err
	}

	// Check if the user is the owner of the playlist
	if playlist.CreatedBy != username {
		return errors.New("unauthorized: only playlist owner can add songs")
	}

	// Verify music exists
	_, err = s.musicRepo.FindByID(musicID)
	if err != nil {
		return errors.New("music not found")
	}

	return s.playlistRepo.AddSong(playlistID, musicID)
}

func (s *playlistService) RemoveSongFromPlaylist(playlistID, musicID uint, username string) error {
	// Get playlist to check ownership
	playlist, err := s.playlistRepo.FindByID(playlistID)
	if err != nil {
		return err
	}

	// Check if the user is the owner of the playlist
	if playlist.CreatedBy != username {
		return errors.New("unauthorized: only playlist owner can remove songs")
	}

	return s.playlistRepo.RemoveSong(playlistID, musicID)
}

func (s *playlistService) GetPlaylistSongs(playlistID uint, username string) ([]*domain.Music, error) {
	// Get playlist to check ownership
	playlist, err := s.playlistRepo.FindByID(playlistID)
	if err != nil {
		return nil, err
	}

	// Check if the user is the owner of the playlist
	if playlist.CreatedBy != username {
		return nil, errors.New("unauthorized: only playlist owner can view songs")
	}

	return s.playlistRepo.GetSongs(playlistID)
}
