package controllers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strconv"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/aliBordbar1992/musicstream-backend/internal/services"
	"github.com/gin-gonic/gin"
)

const maxChunkSize int64 = 64 * 1024 // 64 KB for testing

type MusicController struct {
	musicService  domain.MusicService
	uploadService services.UploadService
	linkValidator domain.LinkValidator
}

// NewMusicController creates a new instance of MusicController
func NewMusicController(musicService domain.MusicService, uploadService services.UploadService, linkValidator domain.LinkValidator) *MusicController {
	return &MusicController{
		musicService:  musicService,
		uploadService: uploadService,
		linkValidator: linkValidator,
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
/* func (c *MusicController) StreamMusic(ctx *gin.Context) {
	id := ctx.Param("id")
	music, err := c.musicService.GetMusic(uint(parseUint(id)))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Music not found"})
		return
	}

	ctx.File(music.FilePath)
} */

// StreamMusic streams a music file with byte-range support (for HTTP/1.1 and HTTP/2)
func (c *MusicController) StreamMusic(ctx *gin.Context) {
	id := ctx.Param("id")
	music, err := c.musicService.GetMusic(uint(parseUint(id)))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Music not found"})
		return
	}

	file, err := os.Open(music.FilePath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "File open error"})
		return
	}
	defer file.Close()

	stat, _ := file.Stat()
	fileSize := stat.Size()
	ctx.Header("Accept-Ranges", "bytes")

	rangeHeader := ctx.GetHeader("Range")
	if rangeHeader == "" {
		// No range requested, serve full file
		ctx.Header("Content-Length", fmt.Sprintf("%d", fileSize))
		ctx.Header("Content-Type", "audio/mpeg")
		ctx.File(music.FilePath)
		return
	}

	// Example Range: bytes=0-1023
	matches := regexp.MustCompile(`bytes=(\d*)-(\d*)`).FindStringSubmatch(rangeHeader)
	if len(matches) != 3 {
		ctx.Status(http.StatusRequestedRangeNotSatisfiable)
		return
	}

	var start, end int64
	if matches[1] != "" {
		start, _ = strconv.ParseInt(matches[1], 10, 64)
	}
	if matches[2] != "" {
		end, _ = strconv.ParseInt(matches[2], 10, 64)
	} else {
		end = fileSize - 1
	}

	if start > end || end >= fileSize {
		ctx.Status(http.StatusRequestedRangeNotSatisfiable)
		return
	}

	chunkSize := end - start + 1
	if chunkSize > maxChunkSize {
		end = start + maxChunkSize - 1
		chunkSize = maxChunkSize
	}

	ctx.Status(http.StatusPartialContent)
	ctx.Header("Content-Type", "audio/mpeg")
	ctx.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, fileSize))
	ctx.Header("Content-Length", fmt.Sprintf("%d", chunkSize))

	file.Seek(start, io.SeekStart)
	io.CopyN(ctx.Writer, file, chunkSize)
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

func (c *MusicController) SearchMusic(ctx *gin.Context) {
	query := ctx.Query("q")
	music, err := c.musicService.SearchMusic(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search music"})
		return
	}

	ctx.JSON(http.StatusOK, music)
}

// DownloadMusicFromURL handles downloading music from a URL
func (c *MusicController) DownloadMusicFromURL(ctx *gin.Context) {
	fileService := services.NewFileService()

	music, err := c.uploadService.HandleMusicDownload(ctx, fileService, c.musicService)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Music downloaded successfully",
		"music":   music,
	})
}
