package repositories

import (
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
