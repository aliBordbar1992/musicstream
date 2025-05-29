package domain

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	Username       string         `json:"username" gorm:"primaryKey;not null"`
	Password       string         `json:"-" gorm:"not null"` // Password is not exposed in JSON
	Name           *string        `json:"name" gorm:"null"`
	ProfilePicture *string        `json:"profile_picture" gorm:"null"`
	CreatedAt      time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

// UserRepository defines the interface for user data operations
type UserRepository interface {
	Create(user *User) error
	FindByUsername(username string) (*User, error)
	Delete(username string) error
	Update(user *User) error
}

// UserService defines the interface for user business logic
type UserService interface {
	Register(username, password string) error
	Login(username, password string) (string, error)
	GetUser(username string) (*User, error)
	UpdateProfile(username string, name string, profilePicture string) error
}
