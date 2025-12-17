package models

import (
	"gorm.io/gorm"
)

// User represents any user of the application (seller, consumer, or admin)
type User struct {
	gorm.Model
	Email         string `json:"email" gorm:"unique"`
	Password      string `json:"-"`
	Role          string `json:"role"`  // Values: "seller", "consumer", "admin"
	Name          string `json:"name"`
	
	// Business identification fields
	CNPJ          string `json:"cnpj,omitempty"`    // Only for sellers
	CPF           string `json:"cpf,omitempty"`     // Only for consumers
	
	// Admin-specific fields
	IsActive      bool   `json:"is_active" gorm:"default:true"` // For disabling admin accounts
	Permissions   string `json:"permissions,omitempty"`         // JSON string of admin permissions
	
	// Address fields
	AddressStreet string `json:"address_street"`
	AddressNumber string `json:"address_number"`
	AddressCity   string `json:"address_city"`
	AddressState  string `json:"address_state"`
	AddressZip    string `json:"address_zip"`
}

// Basket represents a product that sellers can offer
type Basket struct {
	gorm.Model
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	UserID      uint    `json:"seller_id"`
}

// Subscription represents a recurring purchase of a basket by a consumer
type Subscription struct {
	gorm.Model
	UserID    uint   `json:"user_id"`
	User      User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	BasketID  uint   `json:"basket_id"`
	Basket    Basket `json:"basket,omitempty" gorm:"foreignKey:BasketID"`
	Frequency string `json:"frequency"`
	Status    string `json:"status"`
}

// Order represents a delivery of a subscription
type Order struct {
	gorm.Model
	SubscriptionID uint         `json:"subscription_id"`
	Subscription   Subscription `json:"subscription,omitempty" gorm:"foreignKey:SubscriptionID"`
	Status         string       `json:"status"`
}