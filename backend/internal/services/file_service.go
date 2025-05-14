package services

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/faiface/beep"
	"github.com/faiface/beep/mp3"
	"github.com/faiface/beep/vorbis"
	"github.com/faiface/beep/wav"
)

// FileService handles file system operations
type FileService interface {
	SaveFile(filePath string, content []byte) error
	CalculateAudioDuration(filePath string) (float64, error)
	ValidateAudioFile(extension string) error
	EnsureDirectoryExists(dir string) error
	DeleteFile(filePath string) error
}

type fileService struct {
	allowedExtensions map[string]bool
}

// NewFileService creates a new instance of FileService
func NewFileService() FileService {
	return &fileService{
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
