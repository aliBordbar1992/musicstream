package controllers

import (
	"net/http"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService domain.UserService
}

// NewUserController creates a new instance of UserController
func NewUserController(userService domain.UserService) *UserController {
	return &UserController{userService: userService}
}

// Register handles user registration
func (c *UserController) Register(ctx *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := c.userService.Register(req.Username, req.Password); err != nil {
		ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

// Login handles user login
func (c *UserController) Login(ctx *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	token, err := c.userService.Login(req.Username, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"token": token})
}

// GetUser handles getting user information
func (c *UserController) GetUser(ctx *gin.Context) {
	username := ctx.GetString("username")
	user, err := c.userService.GetUser(username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	ctx.JSON(http.StatusOK, user)
}

// UpdateProfile handles updating user profile information
func (c *UserController) UpdateProfile(ctx *gin.Context) {
	username := ctx.GetString("username")

	var req struct {
		Name           string `json:"name" binding:"required"`
		ProfilePicture string `json:"profile_picture"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := c.userService.UpdateProfile(username, req.Name, req.ProfilePicture); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}
