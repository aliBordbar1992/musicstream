package main

import (
	"context"
	"log"
	"os"

	"github.com/aliBordbar1992/musicstream-backend/internal/domain"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

var (
	redisClient *redis.Client
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	if err := OpenDB(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize Redis client
	redisClient = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"),
		Password: os.Getenv("REDIS_PASSWORD"), // no password set
		DB:       0,                           // use default DB
	})

	// Test Redis connection
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
}

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

	// Initialize services

	RegisterRoutes(r)
	r.RunTLS(":8080", "./certs/server.crt", "./certs/server.key")
}
