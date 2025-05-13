package controllers

import (
	"net/http"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/gin-gonic/gin"
)

type ArtistController struct {
	service domain.ArtistService
}

func NewArtistController(service domain.ArtistService) *ArtistController {
	return &ArtistController{service: service}
}

func (c *ArtistController) SearchArtists(ctx *gin.Context) {
	query := ctx.Query("query")
	if query == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter is required"})
		return
	}

	artists, err := c.service.SearchArtists(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search artists"})
		return
	}

	ctx.JSON(http.StatusOK, artists)
}

func (c *ArtistController) CreateArtist(ctx *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	artist, err := c.service.GetOrCreateArtist(input.Name)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create artist"})
		return
	}

	ctx.JSON(http.StatusOK, artist)
}
