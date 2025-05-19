package services

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/faiface/beep"
	"github.com/faiface/beep/mp3"
	"github.com/faiface/beep/vorbis"
	"github.com/faiface/beep/wav"
)

// FileService handles file system operations
type FileService interface {
	DownloadFile(url string, filePath string, linkValidator domain.LinkValidator) (string, error)
	SaveFile(filePath string, content []byte) error
	CalculateAudioDuration(filePath string) (float64, error)
	ValidateAudioFile(extension string) error
	EnsureDirectoryExists(dir string) error
	DeleteFile(filePath string) error
}

type fileService struct {
	client            *http.Client
	allowedExtensions map[string]bool
}

// NewFileService creates a new instance of FileService
func NewFileService() FileService {
	return &fileService{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		allowedExtensions: map[string]bool{
			".mp3": true,
			".wav": true,
			".ogg": true,
		},
	}
}

func (s *fileService) SaveFile(filePath string, content []byte) error {
	return os.WriteFile(filePath, content, 0644)
}

func (s *fileService) CalculateAudioDuration(filename string) (float64, error) {
	f, err := os.Open(filename)
	if err != nil {
		return 0, err
	}
	defer f.Close()

	var streamer beep.StreamSeekCloser
	var format beep.Format

	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".mp3":
		streamer, format, err = mp3.Decode(f)
	case ".wav":
		streamer, format, err = wav.Decode(f)
	case ".ogg":
		streamer, format, err = vorbis.Decode(f)
	default:
		return 0, fmt.Errorf("unsupported file format: %s", ext)
	}

	if err != nil {
		return 0, err
	}
	defer streamer.Close()

	duration := float64(streamer.Len()) / float64(format.SampleRate)
	return duration, nil
}

func (s *fileService) ValidateAudioFile(extension string) error {
	if !s.allowedExtensions[strings.ToLower(extension)] {
		return fmt.Errorf("invalid file type. Only MP3, WAV, and OGG files are allowed")
	}
	return nil
}

func (s *fileService) EnsureDirectoryExists(dir string) error {
	return os.MkdirAll(dir, 0755)
}

// DeleteFile deletes a file from the file system
func (s *fileService) DeleteFile(filePath string) error {
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete file: %v", err)
	}
	return nil
}

// DownloadFile downloads a file from the provided URL
func (s *fileService) DownloadFile(url string, filePath string, linkValidator domain.LinkValidator) (string, error) {
	// Validate the URL
	if err := linkValidator.ValidateLink(url); err != nil {
		return "", fmt.Errorf("invalid music URL: %w", err)
	}

	// Download the file
	resp, err := s.client.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to download file: %w", err)
	}
	defer resp.Body.Close()

	// Create the file
	file, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	// Copy the file content
	if _, err := io.Copy(file, resp.Body); err != nil {
		os.Remove(filePath) // Clean up the file
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	return filePath, nil
}
