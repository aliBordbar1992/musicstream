package repositories

import (
	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"gorm.io/gorm"
)

type artistRepository struct {
	db *gorm.DB
}

func NewArtistRepository(db *gorm.DB) domain.ArtistRepository {
	return &artistRepository{db: db}
}

func (r *artistRepository) Create(artist *domain.Artist) error {
	return r.db.Create(artist).Error
}

func (r *artistRepository) FindByID(id uint) (*domain.Artist, error) {
	var artist domain.Artist
	err := r.db.First(&artist, id).Error
	if err != nil {
		return nil, err
	}
	return &artist, nil
}

func (r *artistRepository) FindByName(name string) (*domain.Artist, error) {
	var artist domain.Artist
	err := r.db.Where("name = ?", name).First(&artist).Error
	if err != nil {
		return nil, err
	}
	return &artist, nil
}

func (r *artistRepository) Search(query string) ([]*domain.Artist, error) {
	var artists []*domain.Artist
	err := r.db.Where("name LIKE ?", "%"+query+"%").Find(&artists).Error
	return artists, err
}

func (r *artistRepository) FindAll() ([]*domain.Artist, error) {
	var artists []*domain.Artist
	err := r.db.Find(&artists).Error
	return artists, err
}
