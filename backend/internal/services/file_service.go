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
	GetImageExtensionFromBase64(base64file string) (string, error)
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

// downloadChunk downloads a chunk of the file
func (s *fileService) downloadChunk(url string, start, end int64, file *os.File) error {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Set range header for chunked download
	req.Header.Set("Range", fmt.Sprintf("bytes=%d-%d", start, end))

	// Create a client with a longer timeout for chunk downloads
	client := &http.Client{
		Timeout: 5 * time.Minute, // 5 minutes timeout for each chunk
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to download chunk: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusPartialContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Seek to the correct position in the file
	if _, err := file.Seek(start, 0); err != nil {
		return fmt.Errorf("failed to seek in file: %w", err)
	}

	// Copy the chunk to the file
	if _, err := io.Copy(file, resp.Body); err != nil {
		return fmt.Errorf("failed to write chunk: %w", err)
	}

	return nil
}

// DownloadFile downloads a file from the provided URL
func (s *fileService) DownloadFile(url string, filePath string, linkValidator domain.LinkValidator) (string, error) {
	// Validate the URL
	if err := linkValidator.ValidateLink(url); err != nil {
		return "", fmt.Errorf("invalid music URL: %w", err)
	}

	// Get file size
	req, err := http.NewRequest("HEAD", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to get file size: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get file size: status code %d", resp.StatusCode)
	}

	contentLength := resp.ContentLength
	if contentLength <= 0 {
		return "", fmt.Errorf("invalid content length")
	}

	// Create the file
	file, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	// Define chunk size (5MB)
	chunkSize := int64(5 * 1024 * 1024)
	maxRetries := 3

	// Download in chunks
	for start := int64(0); start < contentLength; start += chunkSize {
		end := start + chunkSize - 1
		if end >= contentLength {
			end = contentLength - 1
		}

		var lastErr error
		for retry := 0; retry < maxRetries; retry++ {
			err := s.downloadChunk(url, start, end, file)
			if err == nil {
				break
			}
			lastErr = err
			time.Sleep(time.Second * time.Duration(retry+1)) // Exponential backoff
		}

		if lastErr != nil {
			os.Remove(filePath) // Clean up the file
			return "", fmt.Errorf("failed to download chunk after %d retries: %w", maxRetries, lastErr)
		}
	}

	return filePath, nil
}

func (s *fileService) GetImageExtensionFromBase64(base64file string) (string, error) {
	firstChar := base64file[0]
	switch firstChar {
	case '/':
		return ".jpg", nil
	case 'i':
		return ".png", nil
	case 'U':
		return ".webp", nil
	default:
		return "", fmt.Errorf("invalid base64 file, character %d is not a valid image extension", firstChar)
	}
}
