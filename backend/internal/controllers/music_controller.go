package controllers

import (
	"net/http"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/services"
	"github.com/gin-gonic/gin"
)

type MusicController struct {
	musicService  domain.MusicService
	uploadService services.UploadService
}

// NewMusicController creates a new instance of MusicController
func NewMusicController(musicService domain.MusicService, uploadService services.UploadService) *MusicController {
	return &MusicController{
		musicService:  musicService,
		uploadService: uploadService,
	}
}

// UploadMusic handles music file upload
func (c *MusicController) UploadMusic(ctx *gin.Context) {
	fileService := services.NewFileService()
	music, err := c.uploadService.HandleMusicUpload(ctx, fileService, c.musicService)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Music uploaded successfully",
		"music":   music,
	})
}

// GetMusic handles getting music by ID
func (c *MusicController) GetMusic(ctx *gin.Context) {
	id := ctx.Param("id")
	music, err := c.musicService.GetMusic(uint(parseUint(id)))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Music not found"})
		return
	}

	ctx.JSON(http.StatusOK, music)
}

// StreamMusic handles music streaming
func (c *MusicController) StreamMusic(ctx *gin.Context) {
	id := ctx.Param("id")
	music, err := c.musicService.GetMusic(uint(parseUint(id)))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Music not found"})
		return
	}

	ctx.File(music.FilePath)
}

// ListMusic handles listing all music
func (c *MusicController) ListMusic(ctx *gin.Context) {
	music, err := c.musicService.ListAllMusic()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch music"})
		return
	}

	ctx.JSON(http.StatusOK, music)
}

func (c *MusicController) DeleteMusic(ctx *gin.Context) {
	id := ctx.Param("id")
	err := c.musicService.DeleteMusic(uint(parseUint(id)))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete music"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Music deleted successfully"})
}
