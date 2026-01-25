package controllers

import (
	"time"

	"github.com/alexandreffaria/hoby-loop/internal/database"
	"github.com/alexandreffaria/hoby-loop/internal/middleware"
	"github.com/alexandreffaria/hoby-loop/models"
	"github.com/gin-gonic/gin"
)

// CreateSubscriptionInput defines request structure for creating a subscription
type CreateSubscriptionInput struct {
	UserID    uint   `json:"user_id" binding:"required"`
	BasketID  uint   `json:"basket_id" binding:"required"`
	Frequency string `json:"frequency" binding:"required,oneof=weekly biweekly monthly"`
}

// CreateSubscription handles the creation of a new subscription
// and automatically generates the first order based on the basket's frequency
func CreateSubscription(c *gin.Context) {
	var input CreateSubscriptionInput

	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Invalid subscription data", err.Error())
		return
	}

	// Fetch the basket to get frequency information
	var basket models.Basket
	if err := database.DB.First(&basket, input.BasketID).Error; err != nil {
		c.JSON(404, gin.H{"error": "Basket not found"})
		return
	}

	// Calculate the next delivery date based on frequency
	nextDeliveryDate := calculateNextDeliveryDate(input.Frequency)

	// Create the subscription with the calculated next delivery date
	subscription := models.Subscription{
		UserID:           input.UserID,
		BasketID:         input.BasketID,
		Frequency:        input.Frequency,
		Status:           "Active",
		NextDeliveryDate: nextDeliveryDate,
	}

	if err := database.DB.Create(&subscription).Error; err != nil {
		middleware.ServerError(c, "Failed to create subscription: "+err.Error())
		return
	}

	// Automatically generate the first order for this subscription
	firstOrder := models.Order{
		SubscriptionID: subscription.ID,
		Status:         "pending",
		ScheduledDate:  nextDeliveryDate,
		TrackingCode:   "", // Will be filled later when shipped
	}

	if err := database.DB.Create(&firstOrder).Error; err != nil {
		middleware.ServerError(c, "Failed to create first order: "+err.Error())
		return
	}

	middleware.Success(c, subscription)
}

// GetSellerSubscriptions retrieves all active subscriptions for a seller
func GetSellerSubscriptions(c *gin.Context) {
	sellerID := c.Param("id")

	var subscriptions []models.Subscription

	if err := database.DB.Joins("JOIN baskets ON baskets.id = subscriptions.basket_id").
		Where("baskets.user_id = ?", sellerID).
		Preload("User").
		Preload("Basket").
		Find(&subscriptions).Error; err != nil {
		middleware.ServerError(c, "Failed to fetch subscriptions: "+err.Error())
		return
	}

	middleware.Success(c, subscriptions)
}

// GetConsumerSubscriptions retrieves all subscriptions for a specific consumer
func GetConsumerSubscriptions(c *gin.Context) {
	userID := c.Param("id")
	var subscriptions []models.Subscription

	if err := database.DB.Preload("Basket").Where("user_id = ?", userID).Find(&subscriptions).Error; err != nil {
		middleware.ServerError(c, "Failed to fetch subscriptions: "+err.Error())
		return
	}

	middleware.Success(c, subscriptions)
}

// calculateNextDeliveryDate calculates the next delivery date based on frequency
// weekly = 7 days from now, biweekly = 14 days, monthly = 30 days
func calculateNextDeliveryDate(frequency string) time.Time {
	now := time.Now()
	switch frequency {
	case "weekly":
		return now.AddDate(0, 0, 7)
	case "biweekly":
		return now.AddDate(0, 0, 14)
	case "monthly":
		return now.AddDate(0, 0, 30)
	default:
		return now.AddDate(0, 0, 7) // Default to weekly
	}
}

// GenerateNextOrder creates a new order for an existing subscription
// This function is used by cron jobs to generate recurring orders
func GenerateNextOrder(subscriptionID uint) error {
	// Fetch the subscription with its basket information
	var subscription models.Subscription
	if err := database.DB.Preload("Basket").First(&subscription, subscriptionID).Error; err != nil {
		return err
	}

	// Calculate the next delivery date based on the subscription's frequency
	nextDeliveryDate := calculateNextDeliveryDate(subscription.Frequency)

	// Create a new order with the calculated scheduled date
	order := models.Order{
		SubscriptionID: subscription.ID,
		Status:         "pending",
		ScheduledDate:  nextDeliveryDate,
		TrackingCode:   "", // Will be filled later when shipped
	}

	if err := database.DB.Create(&order).Error; err != nil {
		return err
	}

	// Update the subscription's next delivery date
	subscription.NextDeliveryDate = nextDeliveryDate
	if err := database.DB.Save(&subscription).Error; err != nil {
		return err
	}

	return nil
}
