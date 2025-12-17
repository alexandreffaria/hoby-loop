package middleware

import (
	"github.com/alexandreffaria/hoby-loop/internal/database"
	"github.com/alexandreffaria/hoby-loop/models"
	"github.com/gin-gonic/gin"
	"strconv"
)

// AuthMiddleware extracts user information from request
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// For simplicity, we'll use a header-based authentication
		userIDHeader := c.GetHeader("X-User-ID")
		
		// If no user ID provided, continue (authentication will be checked in protected routes)
		if userIDHeader == "" {
			c.Next()
			return
		}
		
		// Convert ID to uint
		userID, err := strconv.ParseUint(userIDHeader, 10, 64)
		if err != nil {
			Unauthorized(c)
			c.Abort()
			return
		}
		
		// Get user from database
		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil {
			Unauthorized(c)
			c.Abort()
			return
		}
		
		// Set user in context
		c.Set("user", user)
		c.Next()
	}
}

// RequireAdmin middleware to protect admin routes
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			Unauthorized(c)
			c.Abort()
			return
		}
		
		userData, ok := user.(models.User)
		if !ok || userData.Role != "admin" {
			Forbidden(c, "Admin access required")
			c.Abort()
			return
		}
		
		c.Next()
	}
}