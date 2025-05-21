package utils

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// ValidateTokenAndGetUsername validates the token and returns the username
// It can be used with both header-based and query-based token validation
func ValidateTokenAndGetUsername(c *gin.Context) (string, error) {
	var token string

	// Try to get token from Authorization header first
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	} else {
		// Fallback to query parameter
		token = c.Query("token")
	}

	if token == "" {
		return "", gin.Error{Err: nil, Type: gin.ErrorTypePrivate, Meta: "token is required"}
	}

	claims, err := ValidateToken(token)
	if err != nil {
		return "", err
	}

	return claims.Username, nil
}

// AuthMiddleware handles authentication using the reusable function
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		username, err := ValidateTokenAndGetUsername(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Set("username", username)
		c.Next()
	}
}
