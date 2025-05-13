package handlers

import (
	"net/http"
	"strings"

	"github.com/aliBordbar1992/musicstream-backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ArtistHandler struct {
	db *gorm.DB
}

func NewArtistHandler(db *gorm.DB) *ArtistHandler {
	return &ArtistHandler{db: db}
}

// SearchArtists handles artist search requests
func (h *ArtistHandler) SearchArtists(c *gin.Context) {
	query := strings.TrimSpace(c.Query("query"))
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter is required"})
		return
	}

	var artists []models.Artist
	if err := h.db.Where("name ILIKE ?", "%"+query+"%").Find(&artists).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search artists"})
		return
	}

	c.JSON(http.StatusOK, artists)
}

// CreateArtist handles artist creation requests
func (h *ArtistHandler) CreateArtist(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if artist already exists
	var existingArtist models.Artist
	if err := h.db.Where("name = ?", input.Name).First(&existingArtist).Error; err == nil {
		c.JSON(http.StatusOK, existingArtist)
		return
	}

	artist := models.Artist{Name: input.Name}
	if err := h.db.Create(&artist).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create artist"})
		return
	}

	c.JSON(http.StatusOK, artist)
}
