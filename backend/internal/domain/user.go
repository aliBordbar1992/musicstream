package domain

import "time"

// User represents a user in the system
type User struct {
	Username  string    `json:"username"`
	Password  string    `json:"-"` // Password is not exposed in JSON
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserRepository defines the interface for user data operations
type UserRepository interface {
	Create(user *User) error
	FindByUsername(username string) (*User, error)
	Delete(username string) error
}

// UserService defines the interface for user business logic
type UserService interface {
	Register(username, password string) error
	Login(username, password string) (string, error)
	GetUser(username string) (*User, error)
}
