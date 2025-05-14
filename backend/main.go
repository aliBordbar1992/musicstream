package main

import (
	"log"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func migrateSchema(db *gorm.DB) error {
	// Auto migrate all models
	return db.AutoMigrate(
		&domain.User{},
		&domain.Session{},
		&domain.Artist{},
		&domain.Music{},
		&domain.Playlist{},
		&domain.PlaylistMusic{},
		&domain.Queue{},
		&domain.QueueItem{},
	)
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	if err := OpenDB(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run the migration
	if err := migrateSchema(DB); err != nil {
		log.Fatal("Failed to migrate schema:", err)
	}

	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}))

	RegisterRoutes(r)
	r.Run(":8080")
}
