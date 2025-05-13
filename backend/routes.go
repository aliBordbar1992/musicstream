package main

import (
	"math/rand"
	"net/http"
	"strings"

	"github.com/aliBordbar1992/musicstream-backend/internal/controllers"
	"github.com/aliBordbar1992/musicstream-backend/internal/repositories"
	"github.com/aliBordbar1992/musicstream-backend/internal/services"
	"github.com/aliBordbar1992/musicstream-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

func generateToken() string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	token := make([]rune, 32)
	for i := range token {
		token[i] = letters[rand.Intn(len(letters))]
	}
	return string(token)
}

// AuthMiddleware handles authentication
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("username", claims.Username)
		c.Next()
	}
}

// RegisterRoutes sets up all the routes for the application
func RegisterRoutes(r *gin.Engine) {
	// Initialize repositories
	userRepo := repositories.NewUserRepository(DB)
	musicRepo := repositories.NewMusicRepository(DB)
	playlistRepo := repositories.NewPlaylistRepository(DB)
	artistRepo := repositories.NewArtistRepository(DB)

	// Initialize services
	userService := services.NewUserService(userRepo)
	musicService := services.NewMusicService(musicRepo, artistRepo)
	playlistService := services.NewPlaylistService(playlistRepo, musicRepo)
	uploadService := services.NewUploadService("uploads")
	artistService := services.NewArtistService(artistRepo)

	// Initialize controllers
	userController := controllers.NewUserController(userService)
	musicController := controllers.NewMusicController(musicService, uploadService)
	playlistController := controllers.NewPlaylistController(playlistService)
	artistController := controllers.NewArtistController(artistService)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// User routes
	r.POST("/register", userController.Register)
	r.POST("/login", userController.Login)
	r.GET("/me", AuthMiddleware(), userController.GetUser)

	// Music routes
	r.POST("/music/upload", AuthMiddleware(), musicController.UploadMusic)
	r.GET("/music/:id", AuthMiddleware(), musicController.GetMusic)
	r.GET("/music/:id/stream", AuthMiddleware(), musicController.StreamMusic)
	r.GET("/music", AuthMiddleware(), musicController.ListMusic)

	// Playlist routes
	r.POST("/playlists", AuthMiddleware(), playlistController.CreatePlaylist)
	r.GET("/playlists/:id", AuthMiddleware(), playlistController.GetPlaylist)
	r.GET("/playlists", AuthMiddleware(), playlistController.ListPlaylists)
	r.DELETE("/playlists/:id", AuthMiddleware(), playlistController.DeletePlaylist)
	r.POST("/playlists/:id/songs", AuthMiddleware(), playlistController.AddSongToPlaylist)
	r.DELETE("/playlists/:id/songs/:musicId", AuthMiddleware(), playlistController.RemoveSongFromPlaylist)

	// Artist routes
	r.GET("/artists/search", AuthMiddleware(), artistController.SearchArtists)
	r.POST("/artists", AuthMiddleware(), artistController.CreateArtist)
}
