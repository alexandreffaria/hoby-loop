package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"fmt"
)

// Define what data we expect from the user
type CreateBasketInput struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Price       float64 `json:"price" binding:"required"`
	SellerID    uint    `json:"seller_id" binding:"required"` 
}

// The actual function that does the work
func CreateBasket(c *gin.Context) {
	var input CreateBasketInput

	// 1. Validate input (ensure all fields are present)
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Create the Basket object
	basket := Basket{
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		UserID:      input.SellerID,
	}

	// 3. Save to Database
	if err := DB.Create(&basket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create basket"})
		return
	}

	// 4. Return the result
	c.JSON(http.StatusOK, gin.H{"data": basket})
}


// Define expected input for a new subscription
type CreateSubscriptionInput struct {
	UserID    uint   `json:"user_id" binding:"required"`
	BasketID  uint   `json:"basket_id" binding:"required"`
	Frequency string `json:"frequency" binding:"required"` // e.g. "weekly"
}

// Function to save the subscription
func CreateSubscription(c *gin.Context) {
	var input CreateSubscriptionInput

	// 1. Validate JSON input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Create the Subscription object
	subscription := Subscription{
		UserID:    input.UserID,
		BasketID:  input.BasketID,
		Frequency: input.Frequency,
		Status:    "Active",
	}

	// 3. Save to Database
	if err := DB.Create(&subscription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
		return
	}

	// 4. Return success
	c.JSON(http.StatusOK, gin.H{"data": subscription})
}

// GetSellerSubscriptions finds all active subscriptions for a seller
func GetSellerSubscriptions(c *gin.Context) {
	sellerID := c.Param("id") // Get ID from URL (e.g., /sellers/1/subscriptions)

	var subscriptions []Subscription

	// The Magic GORM Query:
	// 1. Join with Baskets table
	// 2. Filter where Basket.UserID == sellerID
	// 3. Preload("User") -> Fetch Jane's name
	// 4. Preload("Basket") -> Fetch the "Fruit Box" details
	if err := DB.Joins("JOIN baskets ON baskets.id = subscriptions.basket_id").
		Where("baskets.user_id = ?", sellerID).
		Preload("User").
		Preload("Basket").
		Find(&subscriptions).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
			return
	}

	c.JSON(http.StatusOK, gin.H{"data": subscriptions})
}

// CreateOrder handles the seller starting a delivery
func CreateOrder(c *gin.Context) {
	// Input: Which subscription are we fulfilling?
	var input struct {
		SubscriptionID uint   `json:"subscription_id" binding:"required"`
		Status         string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Create the Order in DB
	order := Order{
		SubscriptionID: input.SubscriptionID,
		Status:         input.Status,
	}
	if err := DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create order"})
		return
	}

	// 2. TRIGGER NOTIFICATION (The "Magic" Part)
	// We use 'go func()' to run this in the background so the user doesn't wait
	go func(subID uint, status string) {
		// In a real app, you would fetch user email here and use SendGrid/AWS SES
		var sub Subscription
		// We need to fetch the User details to get the name/email
		DB.Preload("User").Preload("Basket").First(&sub, subID)
		
		fmt.Printf("\n--- 🔔 NOTIFICATION SENT ---\n")
		fmt.Printf("To: %s <%s>\n", sub.User.Name, sub.User.Email)
		fmt.Printf("Message: Your '%s' is now %s!\n", sub.Basket.Name, status)
		fmt.Printf("----------------------------\n")
	}(input.SubscriptionID, input.Status)

	c.JSON(http.StatusOK, gin.H{"data": order, "message": "Order created and notification queued"})
}