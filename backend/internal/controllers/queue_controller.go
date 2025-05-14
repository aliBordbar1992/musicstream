package controllers

import (
	"net/http"
	"strconv"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/gin-gonic/gin"
)

type QueueController struct {
	queueService domain.QueueService
}

// NewQueueController creates a new instance of QueueController
func NewQueueController(queueService domain.QueueService) *QueueController {
	return &QueueController{queueService: queueService}
}

// CreateQueue creates a new queue with randomized songs
func (c *QueueController) CreateQueue(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	queue, err := c.queueService.CreateQueue("Playing List", username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create queue"})
		return
	}

	ctx.JSON(http.StatusOK, queue)
}

// GetQueue returns the current queue
func (c *QueueController) GetQueue(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	queue, err := c.queueService.GetUserQueue(username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	ctx.JSON(http.StatusOK, queue)
}

// AddToQueue adds a song to the end of the queue
func (c *QueueController) AddToQueue(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		MusicID uint `json:"music_id" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	queue, err := c.queueService.GetUserQueue(username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	// Get the highest position
	items, err := c.queueService.GetQueueItems(queue.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get queue items"})
		return
	}

	maxPosition := -1
	for _, item := range items {
		if item.Position > maxPosition {
			maxPosition = item.Position
		}
	}

	if err := c.queueService.AddToQueue(queue.ID, input.MusicID, maxPosition+1); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add song to queue"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Song added to queue"})
}

// AddToNext adds a song to play next
func (c *QueueController) AddToNext(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		MusicID uint `json:"music_id" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	queue, err := c.queueService.GetUserQueue(username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	if err := c.queueService.AddToNext(queue.ID, input.MusicID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add song to play next"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Song added to play next"})
}

// RemoveFromQueue removes a song from the queue
func (c *QueueController) RemoveFromQueue(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	itemID, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	queue, err := c.queueService.GetUserQueue(username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	if err := c.queueService.RemoveFromQueue(queue.ID, uint(itemID)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove song from queue"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Song removed from queue"})
}

// UpdateQueueItemPosition updates the position of a queue item
func (c *QueueController) UpdateQueueItemPosition(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	itemID, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	var input struct {
		Position int `json:"position" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	queue, err := c.queueService.GetUserQueue(username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}

	if err := c.queueService.MoveItem(queue.ID, uint(itemID), input.Position); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update queue item position"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Queue item position updated"})
}
