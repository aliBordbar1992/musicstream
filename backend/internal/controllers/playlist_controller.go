package controllers

import (
	"net/http"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/gin-gonic/gin"
)

type PlaylistController struct {
	playlistService domain.PlaylistService
}

// NewPlaylistController creates a new instance of PlaylistController
func NewPlaylistController(playlistService domain.PlaylistService) *PlaylistController {
	return &PlaylistController{playlistService: playlistService}
}

// CreatePlaylist handles playlist creation
func (c *PlaylistController) CreatePlaylist(ctx *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	playlist, err := c.playlistService.CreatePlaylist(req.Name, ctx.GetString("username"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create playlist"})
		return
	}

	ctx.JSON(http.StatusOK, playlist)
}

// GetPlaylist handles getting playlist by ID
func (c *PlaylistController) GetPlaylist(ctx *gin.Context) {
	id := ctx.Param("id")
	playlist, err := c.playlistService.GetPlaylist(uint(parseUint(id)), ctx.GetString("username"))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Playlist not found"})
		return
	}

	ctx.JSON(http.StatusOK, playlist)
}

// ListPlaylists handles listing user's playlists
func (c *PlaylistController) ListPlaylists(ctx *gin.Context) {
	playlists, err := c.playlistService.ListUserPlaylists(ctx.GetString("username"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch playlists"})
		return
	}

	ctx.JSON(http.StatusOK, playlists)
}

// DeletePlaylist handles playlist deletion
func (c *PlaylistController) DeletePlaylist(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.playlistService.DeletePlaylist(uint(parseUint(id)), ctx.GetString("username")); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Playlist deleted successfully"})
}

// AddSongToPlaylist handles adding a song to a playlist
func (c *PlaylistController) AddSongToPlaylist(ctx *gin.Context) {
	var req struct {
		MusicID uint `json:"music_id" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	id := ctx.Param("id")
	if err := c.playlistService.AddSongToPlaylist(uint(parseUint(id)), req.MusicID, ctx.GetString("username")); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Song added to playlist successfully"})
}

// RemoveSongFromPlaylist handles removing a song from a playlist
func (c *PlaylistController) RemoveSongFromPlaylist(ctx *gin.Context) {
	id := ctx.Param("id")
	musicID := ctx.Param("musicId")
	if err := c.playlistService.RemoveSongFromPlaylist(uint(parseUint(id)), uint(parseUint(musicID)), ctx.GetString("username")); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Song removed from playlist successfully"})
}

// GetPlaylistSongs handles getting songs from a playlist
func (c *PlaylistController) GetPlaylistSongs(ctx *gin.Context) {
	id := ctx.Param("id")
	songs, err := c.playlistService.GetPlaylistSongs(uint(parseUint(id)), ctx.GetString("username"))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Failed to fetch playlist songs"})
		return
	}

	ctx.JSON(http.StatusOK, songs)
}
