package repositories

import (
	"strings"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"gorm.io/gorm"
)

type musicRepository struct {
	db *gorm.DB
}

// NewMusicRepository creates a new instance of MusicRepository
func NewMusicRepository(db *gorm.DB) domain.MusicRepository {
	return &musicRepository{db: db}
}

func (r *musicRepository) Create(music *domain.Music) error {
	return r.db.Create(music).Error
}

func (r *musicRepository) FindByID(id uint) (*domain.Music, error) {
	var music domain.Music
	err := r.db.Preload("Artist").First(&music, id).Error
	if err != nil {
		return nil, err
	}
	return &music, nil
}

func (r *musicRepository) FindAll() ([]*domain.Music, error) {
	var music []*domain.Music
	err := r.db.Preload("Artist").Find(&music).Error
	return music, err
}

func (r *musicRepository) Delete(id uint) error {
	// Delete all playlist associations
	if err := r.db.Where("music_id = ?", id).Delete(&domain.PlaylistMusic{}).Error; err != nil {
		return err
	}
	// Delete the music record
	return r.db.Delete(&domain.Music{}, id).Error
}

func (r *musicRepository) FindByUploader(username string) ([]*domain.Music, error) {
	var music []*domain.Music
	err := r.db.Preload("Artist").Where("uploaded_by = ?", username).Find(&music).Error
	return music, err
}

func (r *musicRepository) FindByArtist(artistID uint) ([]*domain.Music, error) {
	var music []*domain.Music
	err := r.db.Preload("Artist").Where("artist_id = ?", artistID).Find(&music).Error
	return music, err
}

func (r *musicRepository) FindByTitle(title string) ([]*domain.Music, error) {
	var music []*domain.Music
	search := "%" + strings.ReplaceAll(title, "%", "\\%") + "%"
	err := r.db.Preload("Artist").Where("title ILIKE ?", search).Find(&music).Error
	return music, err
}

// GetFilePath returns the file path for a music record
func (r *musicRepository) GetFilePath(id uint) (string, error) {
	var music domain.Music
	if err := r.db.First(&music, id).Error; err != nil {
		return "", err
	}
	return music.FilePath, nil
}
