package main

import (
	"net/http"

	"github.com/aliBordbar1992/musicstream-backend/internal/controllers"
	"github.com/aliBordbar1992/musicstream-backend/internal/controllers/websocket"
	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/repositories"
	"github.com/aliBordbar1992/musicstream-backend/internal/services"
	"github.com/aliBordbar1992/musicstream-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up all the routes for the application
func RegisterRoutes(r *gin.Engine) {
	// Initialize repositories
	userRepo := repositories.NewUserRepository(DB)
	musicRepo := repositories.NewMusicRepository(DB)
	playlistRepo := repositories.NewPlaylistRepository(DB)
	artistRepo := repositories.NewArtistRepository(DB)
	queueRepo := repositories.NewQueueRepository(DB)

	// Initialize services
	uploadService := services.NewUploadService("uploads", DB)
	userService := services.NewUserService(userRepo, uploadService)
	fileService := services.NewFileService()
	musicService := services.NewMusicService(musicRepo, artistRepo, fileService)
	playlistService := services.NewPlaylistService(playlistRepo, musicRepo)
	artistService := services.NewArtistService(artistRepo)
	queueService := services.NewQueueService(queueRepo, musicRepo)
	cacheService := services.NewRedisCacheService(redisClient)
	listenerService := services.NewListenerService(cacheService, userRepo)

	// Initialize link validator
	linkValidator := domain.NewLinkValidator(&http.Client{})

	// Initialize controllers
	userController := controllers.NewUserController(userService)
	musicController := controllers.NewMusicController(musicService, uploadService, linkValidator)
	playlistController := controllers.NewPlaylistController(playlistService)
	artistController := controllers.NewArtistController(artistService)
	queueController := controllers.NewQueueController(queueService)
	websocketController := websocket.NewWebSocketController(listenerService, userRepo)

	// Serve static files from uploads directory
	r.Static("/uploads", "./uploads")

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// User routes
	r.POST("/register", userController.Register)
	r.POST("/login", userController.Login)
	r.GET("/me", utils.AuthMiddleware(), userController.GetUser)
	r.PUT("/me/profile", utils.AuthMiddleware(), userController.UpdateProfile)

	// Music routes
	r.POST("/music/upload", utils.AuthMiddleware(), musicController.UploadMusic)
	r.POST("/music/download", utils.AuthMiddleware(), musicController.DownloadMusicFromURL)
	r.GET("/music/:id", utils.AuthMiddleware(), musicController.GetMusic)
	r.GET("/music/:id/stream", musicController.StreamMusic)
	r.GET("/music", utils.AuthMiddleware(), musicController.ListMusic)
	r.GET("/music/search", utils.AuthMiddleware(), musicController.SearchMusic)
	r.DELETE("/music/:id", utils.AuthMiddleware(), musicController.DeleteMusic)

	// Playlist routes
	r.POST("/playlists", utils.AuthMiddleware(), playlistController.CreatePlaylist)
	r.GET("/playlists/:id", utils.AuthMiddleware(), playlistController.GetPlaylist)
	r.GET("/playlists", utils.AuthMiddleware(), playlistController.ListPlaylists)
	r.DELETE("/playlists/:id", utils.AuthMiddleware(), playlistController.DeletePlaylist)
	r.POST("/playlists/:id/songs", utils.AuthMiddleware(), playlistController.AddSongToPlaylist)
	r.DELETE("/playlists/:id/songs/:musicId", utils.AuthMiddleware(), playlistController.RemoveSongFromPlaylist)
	r.GET("/playlists/:id/songs", utils.AuthMiddleware(), playlistController.GetPlaylistSongs)

	// Artist routes
	r.GET("/artists/search", utils.AuthMiddleware(), artistController.SearchArtists)
	r.POST("/artists", utils.AuthMiddleware(), artistController.CreateArtist)

	// Queue management routes
	r.POST("/queue", utils.AuthMiddleware(), queueController.CreateQueue)
	r.GET("/queue", utils.AuthMiddleware(), queueController.GetQueue)
	r.POST("/queue/items", utils.AuthMiddleware(), queueController.AddToQueue)
	r.POST("/queue/next", utils.AuthMiddleware(), queueController.AddToNext)
	r.DELETE("/queue/items/:id", utils.AuthMiddleware(), queueController.RemoveFromQueue)
	r.PUT("/queue/items/:id/position", utils.AuthMiddleware(), queueController.UpdateQueueItemPosition)

	// WebSocket route for synchronized listening
	r.GET("/ws/listen", utils.AuthMiddleware(), websocketController.HandleWebSocket)
}
