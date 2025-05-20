package main

import (
	"net/http"
	"strings"

	"github.com/aliBordbar1992/musicstream-backend/internal/controllers"
	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/repositories"
	"github.com/aliBordbar1992/musicstream-backend/internal/services"
	"github.com/aliBordbar1992/musicstream-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

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
	queueRepo := repositories.NewQueueRepository(DB)

	// Initialize services
	userService := services.NewUserService(userRepo)
	fileService := services.NewFileService()
	musicService := services.NewMusicService(musicRepo, artistRepo, fileService)
	playlistService := services.NewPlaylistService(playlistRepo, musicRepo)
	uploadService := services.NewUploadService("uploads", DB)
	artistService := services.NewArtistService(artistRepo)
	queueService := services.NewQueueService(queueRepo, musicRepo)
	cacheService := services.NewRedisCacheService(redisClient)
	listenerService := services.NewListenerService(cacheService)

	// Initialize link validator
	linkValidator := domain.NewLinkValidator(&http.Client{})

	// Initialize controllers
	userController := controllers.NewUserController(userService)
	musicController := controllers.NewMusicController(musicService, uploadService, linkValidator)
	playlistController := controllers.NewPlaylistController(playlistService)
	artistController := controllers.NewArtistController(artistService)
	queueController := controllers.NewQueueController(queueService)
	websocketController := controllers.NewWebSocketController(listenerService)

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
	r.POST("/music/download", AuthMiddleware(), musicController.DownloadMusicFromURL)
	r.GET("/music/:id", AuthMiddleware(), musicController.GetMusic)
	r.GET("/music/:id/stream", AuthMiddleware(), musicController.StreamMusic)
	r.GET("/music", AuthMiddleware(), musicController.ListMusic)
	r.GET("/music/search", AuthMiddleware(), musicController.SearchMusic)
	r.DELETE("/music/:id", AuthMiddleware(), musicController.DeleteMusic)

	// Playlist routes
	r.POST("/playlists", AuthMiddleware(), playlistController.CreatePlaylist)
	r.GET("/playlists/:id", AuthMiddleware(), playlistController.GetPlaylist)
	r.GET("/playlists", AuthMiddleware(), playlistController.ListPlaylists)
	r.DELETE("/playlists/:id", AuthMiddleware(), playlistController.DeletePlaylist)
	r.POST("/playlists/:id/songs", AuthMiddleware(), playlistController.AddSongToPlaylist)
	r.DELETE("/playlists/:id/songs/:musicId", AuthMiddleware(), playlistController.RemoveSongFromPlaylist)
	r.GET("/playlists/:id/songs", AuthMiddleware(), playlistController.GetPlaylistSongs)

	// Artist routes
	r.GET("/artists/search", AuthMiddleware(), artistController.SearchArtists)
	r.POST("/artists", AuthMiddleware(), artistController.CreateArtist)

	// Queue management routes
	r.POST("/queue", AuthMiddleware(), queueController.CreateQueue)
	r.GET("/queue", AuthMiddleware(), queueController.GetQueue)
	r.POST("/queue/items", AuthMiddleware(), queueController.AddToQueue)
	r.POST("/queue/next", AuthMiddleware(), queueController.AddToNext)
	r.DELETE("/queue/items/:id", AuthMiddleware(), queueController.RemoveFromQueue)
	r.PUT("/queue/items/:id/position", AuthMiddleware(), queueController.UpdateQueueItemPosition)

	// WebSocket route for synchronized listening
	r.GET("/ws/listen", AuthMiddleware(), websocketController.HandleWebSocket)
}
