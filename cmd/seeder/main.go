package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/alexandreffaria/hoby-loop/models" 
)

// Helper structs for JSON parsing
type JsonData struct {
	Users         []UserJSON         `json:"users"`
	Baskets       []BasketJSON       `json:"baskets"`
	Subscriptions []SubscriptionJSON `json:"subscriptions"`
}

// UserJSON matches the output structure of generate.py
type UserJSON struct {
	ID       uint   `json:"id"`
	Role     string `json:"role"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	// Nested address object from Python
	Address struct {
		Street  string `json:"street"`
		Number  string `json:"number"`
		City    string `json:"city"`
		State   string `json:"state"`
		ZipCode string `json:"zip_code"`
	} `json:"address"`
}

type BasketJSON struct {
	ID          uint    `json:"id"`
	SellerID    uint    `json:"seller_id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

type SubscriptionJSON struct {
	ID        uint   `json:"id"`
	UserID    uint   `json:"user_id"`
	BasketID  uint   `json:"basket_id"`
	Frequency string `json:"frequency"`
	Status    string `json:"status"`
}

func main() {
	// 1. Connect
	dsn := "host=localhost user=hoby password=password123 dbname=hobyloop port=5433 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("🔄 Migrating database schema...")
	err = db.AutoMigrate(&models.User{}, &models.Basket{}, &models.Subscription{}, &models.Order{})
	if err != nil {
		log.Fatal("Migration failed:", err)
	}

	// 2. Read File
	absPath, _ := filepath.Abs("tools/data.json")
	fileContent, err := ioutil.ReadFile(absPath)
	if err != nil {
		log.Fatal("Error reading data.json:", err)
	}

	var data JsonData
	if err := json.Unmarshal(fileContent, &data); err != nil {
		log.Fatal("Error parsing json:", err)
	}

	// 3. Seed
	fmt.Println("🌱 Seeding database...")
	db.Transaction(func(tx *gorm.DB) error {
		
		// Users
		for _, u := range data.Users {
			user := models.User{
				Model:         gorm.Model{ID: u.ID},
				Name:          u.Name,
				Email:         u.Email,
				Role:          u.Role,
				Password:      u.Password,
				// MAPPING ADDRESS HERE
				AddressStreet: u.Address.Street,
				AddressNumber: u.Address.Number,
				AddressCity:   u.Address.City,
				AddressState:  u.Address.State,
				AddressZip:    u.Address.ZipCode,
			}
			// OnConflict ensures we update existing records instead of crashing
			if err := tx.Clauses(clause.OnConflict{UpdateAll: true}).Create(&user).Error; err != nil {
				return err
			}
		}
		fmt.Printf("✅ Seeded %d Users (with Addresses)\n", len(data.Users))

		// Baskets
		for _, b := range data.Baskets {
			basket := models.Basket{
				Model:       gorm.Model{ID: b.ID},
				UserID:      b.SellerID,
				Name:        b.Name,
				Description: b.Description,
				Price:       b.Price,
			}
			if err := tx.Clauses(clause.OnConflict{UpdateAll: true}).Create(&basket).Error; err != nil {
				return err
			}
		}
		fmt.Printf("✅ Seeded %d Baskets\n", len(data.Baskets))

		// Subscriptions
		for _, s := range data.Subscriptions {
			sub := models.Subscription{
				Model:     gorm.Model{ID: s.ID},
				UserID:    s.UserID,
				BasketID:  s.BasketID,
				Frequency: s.Frequency,
				Status:    s.Status,
			}
			if err := tx.Clauses(clause.OnConflict{UpdateAll: true}).Create(&sub).Error; err != nil {
				return err
			}
		}
		fmt.Printf("✅ Seeded %d Subscriptions\n", len(data.Subscriptions))

		return nil
	})
}