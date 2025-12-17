package controllers

import (
	"fmt"
	"github.com/alexandreffaria/hoby-loop/internal/database"
	"github.com/alexandreffaria/hoby-loop/internal/middleware"
	"github.com/alexandreffaria/hoby-loop/models"
	"github.com/gin-gonic/gin"
)

// GetAllUsers returns all users in the system (admin only)
// Admin authentication is handled by middleware
func GetAllUsers(c *gin.Context) {
	// Get all users
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		middleware.ServerError(c, err.Error())
		return
	}
	
	// Debug information
	userID := c.GetHeader("X-User-ID")
	fmt.Printf("Admin users request - Header X-User-ID: %s, Found %d users\n", userID, len(users))
	
	middleware.Success(c, users)
}

// GetAllSubscriptions returns all subscriptions in the system (admin only)
// Admin authentication is handled by middleware
func GetAllSubscriptions(c *gin.Context) {
	// Get all subscriptions with eager loading of related entities
	var subscriptions []models.Subscription
	if err := database.DB.Preload("User").Preload("Basket").Find(&subscriptions).Error; err != nil {
		middleware.ServerError(c, err.Error())
		return
	}
	
	// Debug information
	userID := c.GetHeader("X-User-ID")
	fmt.Printf("Admin subscriptions request - Header X-User-ID: %s, Found %d subscriptions\n", userID, len(subscriptions))
	
	middleware.Success(c, subscriptions)
}

// GetAllBaskets returns all baskets in the system (admin only)
// Admin authentication is handled by middleware
func GetAllBaskets(c *gin.Context) {
	// Get all baskets
	var baskets []models.Basket
	if err := database.DB.Find(&baskets).Error; err != nil {
		middleware.ServerError(c, err.Error())
		return
	}
	
	// Debug information
	userID := c.GetHeader("X-User-ID")
	fmt.Printf("Admin baskets request - Header X-User-ID: %s, Found %d baskets\n", userID, len(baskets))
	
	middleware.Success(c, baskets)
}