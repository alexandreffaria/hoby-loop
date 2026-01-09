package controllers

import (
	"fmt"
	"time"

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

// GetSubscriptionOrders retrieves all orders for a specific subscription
func GetSubscriptionOrders(c *gin.Context) {
	subscriptionID := c.Param("id")
	var orders []models.Order

	if err := database.DB.Where("subscription_id = ?", subscriptionID).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		middleware.ServerError(c, "Failed to fetch orders: "+err.Error())
		return
	}

	middleware.Success(c, orders)
}

// GetBasketOrders retrieves all orders for baskets owned by a seller
func GetBasketOrders(c *gin.Context) {
	basketID := c.Param("id")
	var orders []models.Order

	// Get all subscriptions for this basket, then get their orders
	if err := database.DB.Joins("JOIN subscriptions ON subscriptions.id = orders.subscription_id").
		Where("subscriptions.basket_id = ?", basketID).
		Preload("Subscription").
		Preload("Subscription.User").
		Preload("Subscription.Basket").
		Order("orders.created_at DESC").
		Find(&orders).Error; err != nil {
		middleware.ServerError(c, "Failed to fetch orders: "+err.Error())
		return
	}

	middleware.Success(c, orders)
}

// UpdateOrderStatusInput defines request structure for updating order status
type UpdateOrderStatusInput struct {
	Status       string `json:"status" binding:"required,oneof=preparing shipped delivered"`
	TrackingCode string `json:"tracking_code,omitempty"`
}

// UpdateOrderStatus updates the status of an order
func UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")
	var input UpdateOrderStatusInput

	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Invalid status data", err.Error())
		return
	}

	var order models.Order
	if err := database.DB.First(&order, orderID).Error; err != nil {
		middleware.NotFound(c, "Order not found")
		return
	}

	// Update status
	order.Status = input.Status
	if input.TrackingCode != "" {
		order.TrackingCode = input.TrackingCode
	}

	// Set timestamps based on status
	now := time.Now()
	if input.Status == "shipped" && order.ShippedAt == nil {
		order.ShippedAt = &now
	}
	if input.Status == "delivered" && order.DeliveredAt == nil {
		order.DeliveredAt = &now
	}

	if err := database.DB.Save(&order).Error; err != nil {
		middleware.ServerError(c, "Failed to update order: "+err.Error())
		return
	}

	// Send notification
	go sendOrderNotification(order.SubscriptionID, input.Status)

	middleware.Success(c, order)
}

// GetOrder retrieves a single order by ID
func GetOrder(c *gin.Context) {
	orderID := c.Param("id")
	var order models.Order

	if err := database.DB.Preload("Subscription").
		Preload("Subscription.User").
		Preload("Subscription.Basket").
		First(&order, orderID).Error; err != nil {
		middleware.NotFound(c, "Order not found")
		return
	}

	middleware.Success(c, order)
}