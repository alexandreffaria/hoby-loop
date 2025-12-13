package models

import (
	"gorm.io/gorm"
)

// User represents anyone using the app (Seller or Consumer)
type User struct {
	gorm.Model
	Email    string   `json:"email" gorm:"unique"`
	Password string   `json:"-"`
	Role     string   `json:"role"`
	Name     string   `json:"name"`

	// Address Fields
	AddressStreet string `json:"address_street"`
	AddressNumber string `json:"address_number"`
	AddressCity   string `json:"address_city"`
	AddressState  string `json:"address_state"`
	AddressZip    string `json:"address_zip"`

	// Relationships
	Baskets       []Basket       `json:"baskets,omitempty"`
	Subscriptions []Subscription `json:"subscriptions,omitempty"`
}

type Basket struct {
	gorm.Model
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	UserID      uint    `json:"seller_id"`
}

type Subscription struct {
	gorm.Model
	UserID   uint   `json:"user_id"`
	User     User   `json:"user" gorm:"foreignKey:UserID"`
	BasketID uint   `json:"basket_id"`
	Basket   Basket `json:"basket" gorm:"foreignKey:BasketID"`
	Frequency string `json:"frequency"`
	Status    string `json:"status"`
}

type Order struct {
	gorm.Model
	SubscriptionID uint         `json:"subscription_id"`
	Subscription   Subscription `json:"subscription" gorm:"foreignKey:SubscriptionID"`
	Status         string       `json:"status"`
}