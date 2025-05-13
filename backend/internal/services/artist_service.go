package services

import (
	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
)

type artistService struct {
	repo domain.ArtistRepository
}

func NewArtistService(repo domain.ArtistRepository) domain.ArtistService {
	return &artistService{repo: repo}
}

func (s *artistService) CreateArtist(name string) (*domain.Artist, error) {
	artist := &domain.Artist{Name: name}
	err := s.repo.Create(artist)
	if err != nil {
		return nil, err
	}
	return artist, nil
}

func (s *artistService) GetArtist(id uint) (*domain.Artist, error) {
	return s.repo.FindByID(id)
}

func (s *artistService) SearchArtists(query string) ([]*domain.Artist, error) {
	return s.repo.Search(query)
}

func (s *artistService) GetOrCreateArtist(name string) (*domain.Artist, error) {
	// Try to find existing artist
	artist, err := s.repo.FindByName(name)
	if err == nil {
		return artist, nil
	}

	// Create new artist if not found
	return s.CreateArtist(name)
}
