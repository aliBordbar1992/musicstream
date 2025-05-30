package services

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UploadService interface {
	HandleMusicUpload(ctx *gin.Context, fileService FileService, musicService domain.MusicService) (*domain.Music, error)
	HandleMusicDownload(ctx *gin.Context, fileService FileService, musicService domain.MusicService) (*domain.Music, error)
	HandleProfilePictureUpload(base64file string, fileService FileService) (string, error)
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
	if err := fileService.EnsureDirectoryExists(getMusicUploadDir(s)); err != nil {
		return nil, err
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	filePath := filepath.Join(getMusicUploadDir(s), filename)

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
	filePath := filepath.Join(getMusicUploadDir(s), filename)

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

func (s *uploadService) HandleProfilePictureUpload(base64file string, fileService FileService) (string, error) {
	// decode base64 file
	// if base64file starts with data:etc, then remove the data:etc,
	if strings.HasPrefix(base64file, "data:") {
		base64file = strings.Split(base64file, ",")[1]
	}
	decodedFile, err := base64.StdEncoding.DecodeString(base64file)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64 file: %w", err)
	}

	// save file to storage
	ext, err := fileService.GetImageExtensionFromBase64(base64file)
	if err != nil {
		return "", fmt.Errorf("failed to get image extension: %w", err)
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), uuid.New().String())

	// Create upload directory if it doesn't exist
	if err := fileService.EnsureDirectoryExists(getProfilePictureUploadDir(s)); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	filePath := filepath.Join(getProfilePictureUploadDir(s), filename+ext)
	if err := fileService.SaveFile(filePath, decodedFile); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	return filePath, nil
}

func getMusicUploadDir(s *uploadService) string {
	return s.uploadDir
}

func getProfilePictureUploadDir(s *uploadService) string {
	return fmt.Sprintf("%s/profile_pictures", s.uploadDir)
}
