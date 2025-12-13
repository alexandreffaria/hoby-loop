package main

import (
	"gorm.io/gorm"
)

// User represents anyone using the app (Seller or Consumer)
type User struct {
	gorm.Model        // Adds ID, CreatedAt, UpdatedAt automatically
	Email    string   `json:"email" gorm:"unique"`
	Password string   `json:"-"`              // The "-" prevents sending password in API responses
	Role     string   `json:"role"`           // "seller" or "consumer"
	Name     string   `json:"name"`
	
	// Relationships
	Baskets  []Basket `json:"baskets,omitempty"` // A seller can have many baskets
	Subscriptions []Subscription `json:"subscriptions,omitempty"` // A consumer can have many subscriptions
}

// Basket represents a subscription bundle created by a Seller
type Basket struct {
	gorm.Model
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	
	// Foreign Key: Connects this basket to a specific User (Seller)
	UserID      uint    `json:"seller_id"` 
}

type Subscription struct {
	gorm.Model
	UserID   uint `json:"user_id"`   // The consumer subscribing
	User User `json:"user" gorm:"foreignKey:UserID"`      // The consumer details
	
	BasketID uint `json:"basket_id"` // The basket being subscribed to
	Basket    Basket `json:"basket" gorm:"foreignKey:BasketID"`
	
	Frequency string `json:"frequency"` // e.g., "weekly", "monthly"
	Status   string `json:"status"`    // e.g., "active", "paused", "cancelled"
}

type Order struct {
	gorm.Model
	SubscriptionID uint `json:"subscription_id"` // The subscription this order belongs to
	Subscription   Subscription `json:"subscription" gorm:"foreignKey:SubscriptionID"`
	Status       string `json:"status"`        // e.g., "pending", "delivered"
}