package controllers

import (
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
func CreateSubscription(c *gin.Context) {
	var input CreateSubscriptionInput

	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Invalid subscription data", err.Error())
		return
	}

	subscription := models.Subscription{
		UserID:    input.UserID,
		BasketID:  input.BasketID,
		Frequency: input.Frequency,
		Status:    "Active",
	}

	if err := database.DB.Create(&subscription).Error; err != nil {
		middleware.ServerError(c, "Failed to create subscription: "+err.Error())
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