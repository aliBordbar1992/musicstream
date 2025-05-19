package services

import (
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
)

type musicService struct {
	musicRepo   domain.MusicRepository
	artistRepo  domain.ArtistRepository
	fileService FileService
}

// NewMusicService creates a new instance of MusicService
func NewMusicService(musicRepo domain.MusicRepository, artistRepo domain.ArtistRepository, fileService FileService) domain.MusicService {
	return &musicService{
		musicRepo:   musicRepo,
		artistRepo:  artistRepo,
		fileService: fileService,
	}
}

func (s *musicService) UploadMusic(title string, artistID uint, album, filePath, username string, duration float64) (*domain.Music, error) {
	// Verify artist exists
	artist, err := s.artistRepo.FindByID(artistID)
	if err != nil {
		return nil, err
	}

	music := &domain.Music{
		Title:      title,
		ArtistID:   artistID,
		Artist:     artist,
		Album:      album,
		FilePath:   filePath,
		UploadedBy: username,
		Duration:   duration,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := s.musicRepo.Create(music); err != nil {
		return nil, err
	}

	return music, nil
}

func (s *musicService) GetMusic(id uint) (*domain.Music, error) {
	return s.musicRepo.FindByID(id)
}

func (s *musicService) ListAllMusic() ([]*domain.Music, error) {
	return s.musicRepo.FindAll()
}

func (s *musicService) DeleteMusic(id uint) error {
	// Get the file path before deleting the record
	filePath, err := s.musicRepo.GetFilePath(id)
	if err != nil {
		return err
	}

	// Delete the file
	if err := s.fileService.DeleteFile(filePath); err != nil {
		return err
	}

	// Delete from database
	return s.musicRepo.Delete(id)
}

func (s *musicService) GetUserMusic(username string) ([]*domain.Music, error) {
	return s.musicRepo.FindByUploader(username)
}

func (s *musicService) GetMusicByArtist(artistID uint) ([]*domain.Music, error) {
	return s.musicRepo.FindByArtist(artistID)
}

func (s *musicService) SearchMusic(query string) ([]*domain.Music, error) {
	return s.musicRepo.FindByTitle(query)
}
