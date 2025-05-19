package services

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UploadService interface {
	HandleMusicUpload(ctx *gin.Context, fileService FileService, musicService domain.MusicService) (*domain.Music, error)
	HandleMusicDownload(ctx *gin.Context, fileService FileService, musicService domain.MusicService) (*domain.Music, error)
}

type uploadService struct {
	uploadDir string
	db        *gorm.DB
}

func NewUploadService(uploadDir string, db *gorm.DB) UploadService {
	return &uploadService{
		uploadDir: uploadDir,
		db:        db,
	}
}

func (s *uploadService) HandleMusicUpload(ctx *gin.Context, fileService FileService, musicService domain.MusicService) (*domain.Music, error) {
	// Get form data
	title := ctx.PostForm("title")
	artistName := ctx.PostForm("artist")
	album := ctx.PostForm("album")
	username := ctx.GetString("username")

	// Get the uploaded file
	file, err := ctx.FormFile("music")
	if err != nil {
		return nil, fmt.Errorf("failed to get uploaded file: %v", err)
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	if err := fileService.ValidateAudioFile(ext); err != nil {
		return nil, err
	}

	// Create upload directory if it doesn't exist
	if err := fileService.EnsureDirectoryExists(s.uploadDir); err != nil {
		return nil, err
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	filePath := filepath.Join(s.uploadDir, filename)

	// Save the file using Gin's built-in method
	if err := ctx.SaveUploadedFile(file, filePath); err != nil {
		return nil, fmt.Errorf("failed to save file: %v", err)
	}

	// Get file duration
	duration, err := fileService.CalculateAudioDuration(filePath)
	if err != nil {
		os.Remove(filePath) // Clean up the file
		return nil, fmt.Errorf("failed to get file duration: %v", err)
	}

	// Create or get artist
	artistService := NewArtistService(repositories.NewArtistRepository(s.db))
	artist, err := artistService.GetOrCreateArtist(artistName)
	if err != nil {
		os.Remove(filePath) // Clean up the file
		return nil, fmt.Errorf("failed to process artist: %v", err)
	}

	// Create music record
	music, err := musicService.UploadMusic(title, artist.ID, album, filePath, username, duration)
	if err != nil {
		os.Remove(filePath) // Clean up the file
		return nil, fmt.Errorf("failed to save music record: %v", err)
	}

	return music, nil
}

// HandleMusicDownload handles downloading music from a URL
func (s *uploadService) HandleMusicDownload(ctx *gin.Context, fileService FileService, musicService domain.MusicService) (*domain.Music, error) {
	var req struct {
		URL    string `json:"url" binding:"required"`
		Title  string `json:"title" binding:"required"`
		Artist string `json:"artist" binding:"required"`
		Album  string `json:"album"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		return nil, fmt.Errorf("invalid request: %w", err)
	}

	linkValidator := domain.NewLinkValidator(&http.Client{})

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s.%s", time.Now().UnixNano(), req.Title, filepath.Ext(req.URL))
	filePath := filepath.Join(s.uploadDir, filename)

	// Download the file
	_, err := fileService.DownloadFile(req.URL, filePath, linkValidator)
	if err != nil {
		return nil, fmt.Errorf("failed to download music: %w", err)
	}

	// Get file duration
	duration, err := fileService.CalculateAudioDuration(filePath)
	if err != nil {
		os.Remove(filePath) // Clean up the file
		return nil, fmt.Errorf("failed to get file duration: %v", err)
	}

	// Create or get artist
	artistService := NewArtistService(repositories.NewArtistRepository(s.db))
	artist, err := artistService.GetOrCreateArtist(req.Artist)
	if err != nil {
		os.Remove(filePath) // Clean up the file
		return nil, fmt.Errorf("failed to process artist: %w", err)
	}

	// Create music record
	music, err := musicService.UploadMusic(
		req.Title,
		artist.ID,
		req.Album,
		filePath,
		ctx.GetString("username"),
		duration,
	)
	if err != nil {
		os.Remove(filePath) // Clean up the file
		return nil, fmt.Errorf("failed to save music record: %w", err)
	}

	return music, nil
}
