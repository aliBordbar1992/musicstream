package services

import (
	"errors"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/utils"
)

type userService struct {
	userRepo domain.UserRepository
}

// NewUserService creates a new instance of UserService
func NewUserService(userRepo domain.UserRepository) domain.UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) Register(username, password string) error {
	// Check if user already exists
	existingUser, err := s.userRepo.FindByUsername(username)
	if err == nil && existingUser != nil {
		return errors.New("user already exists")
	}

	user := &domain.User{
		Username:  username,
		Password:  password, // In a real application, this should be hashed
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	return s.userRepo.Create(user)
}

func (s *userService) Login(username, password string) (string, error) {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return "", errors.New("invalid username or password")
	}

	if user.Password != password { // In a real application, compare hashed passwords
		return "", errors.New("invalid username or password")
	}

	// Generate JWT token
	token, err := utils.GenerateToken(username)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *userService) GetUser(username string) (*domain.User, error) {
	return s.userRepo.FindByUsername(username)
}

// Helper function to generate token
func generateToken() string {
	// implement proper token generation

	return "dummy-token"
}
