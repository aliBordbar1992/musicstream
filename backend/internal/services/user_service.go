package services

import (
	"errors"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/utils"
)

type userService struct {
	userRepo      domain.UserRepository
	uploadService UploadService
}

// NewUserService creates a new instance of UserService
func NewUserService(userRepo domain.UserRepository, uploadService UploadService) domain.UserService {
	return &userService{userRepo: userRepo, uploadService: uploadService}
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

func (s *userService) UpdateProfile(username string, name string, profilePicture string) error {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return errors.New("user not found")
	}

	user.Name = &name
	if profilePicture != "" {
		// save profile picture to storage and set the url to the user
		// using upload service
		profilePicture, err := s.uploadService.HandleProfilePictureUpload(profilePicture, NewFileService())
		if err != nil {
			return errors.New("failed to save profile picture: " + err.Error())
		}
		user.ProfilePicture = &profilePicture
	} else {
		user.ProfilePicture = nil
	}
	user.UpdatedAt = time.Now()

	return s.userRepo.Update(user)
}
