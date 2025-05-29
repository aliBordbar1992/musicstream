package repositories

import (
	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new instance of UserRepository
func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *domain.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) FindByUsername(username string) (*domain.User, error) {
	var user domain.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Delete(username string) error {
	return r.db.Where("username = ?", username).Delete(&domain.User{}).Error
}

func (r *userRepository) Update(user *domain.User) error {
	return r.db.Save(user).Error
}
