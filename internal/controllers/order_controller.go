package controllers

import (
	"fmt"

	"github.com/alexandreffaria/hoby-loop/internal/database"
	"github.com/alexandreffaria/hoby-loop/internal/middleware"
	"github.com/alexandreffaria/hoby-loop/models"
	"github.com/gin-gonic/gin"
)

// CreateOrderInput defines request structure for creating an order
type CreateOrderInput struct {
	SubscriptionID uint   `json:"subscription_id" binding:"required"`
	Status         string `json:"status" binding:"required,oneof=Processing Shipped Delivered Cancelled"`
}

// CreateOrder handles the creation of a new delivery order
func CreateOrder(c *gin.Context) {
	var input CreateOrderInput

	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Invalid order data", err.Error())
		return
	}

	// Verify subscription exists
	var subscription models.Subscription
	if err := database.DB.First(&subscription, input.SubscriptionID).Error; err != nil {
		middleware.NotFound(c, "Subscription not found")
		return
	}

	order := models.Order{
		SubscriptionID: input.SubscriptionID,
		Status:         input.Status,
	}

	if err := database.DB.Create(&order).Error; err != nil {
		middleware.ServerError(c, "Could not create order: "+err.Error())
		return
	}

	// Send notification in the background
	go sendOrderNotification(input.SubscriptionID, input.Status)

	middleware.Success(c, map[string]interface{}{
		"order":   order,
		"message": "Order created and notification queued",
	})
}

// sendOrderNotification sends a notification about order status
func sendOrderNotification(subscriptionID uint, status string) {
	var sub models.Subscription
	
	// Fetch subscription with related data
	database.DB.Preload("User").Preload("Basket").First(&sub, subscriptionID)
	
	// In a real app, this would send an email or push notification
	fmt.Printf("\n--- 🔔 NOTIFICATION SENT ---\n")
	fmt.Printf("To: %s <%s>\n", sub.User.Name, sub.User.Email)
	fmt.Printf("Message: Your '%s' is now %s!\n", sub.Basket.Name, status)
	fmt.Printf("----------------------------\n")
}