package domain

import (
	"fmt"
	"net/http"
	"strings"
)

// LinkValidator defines the interface for validating music file links
type LinkValidator interface {
	ValidateLink(url string) error
}

// linkValidator implements the LinkValidator interface
type linkValidator struct {
	client *http.Client
}

// NewLinkValidator creates a new instance of LinkValidator
func NewLinkValidator(client *http.Client) LinkValidator {
	return &linkValidator{
		client: client,
	}
}

// ValidateLink checks if the provided URL points to a valid MP3 file
func (v *linkValidator) ValidateLink(url string) error {
	// Check if URL is empty
	if url == "" {
		return fmt.Errorf("empty URL provided")
	}

	// Check if URL has a valid scheme
	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		return fmt.Errorf("invalid URL scheme, must be http or https")
	}

	// Make HEAD request to check content type
	resp, err := v.client.Head(url)
	if err != nil {
		return fmt.Errorf("failed to validate URL: %w", err)
	}
	defer resp.Body.Close()

	// Check if response is successful
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("invalid response status: %d", resp.StatusCode)
	}

	// Check content type
	contentType := resp.Header.Get("Content-Type")
	if !strings.Contains(contentType, "audio/mpeg") && !strings.Contains(contentType, "audio/mp3") {
		return fmt.Errorf("invalid content type: %s, expected audio/mpeg or audio/mp3", contentType)
	}

	return nil
}
