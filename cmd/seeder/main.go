package main

import (
	"encoding/json"
	"fmt"
	"os"
	"log"
	"path/filepath"

	"github.com/alexandreffaria/hoby-loop/config"
	"github.com/alexandreffaria/hoby-loop/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Helper structs for JSON parsing
type JsonData struct {
	Users         []UserJSON         `json:"users"`
	Baskets       []BasketJSON       `json:"baskets"`
	Subscriptions []SubscriptionJSON `json:"subscriptions"`
}

type UserJSON struct {
	ID          uint   `json:"id"`
	Role        string `json:"role"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	CNPJ        string `json:"cnpj,omitempty"`
	CPF         string `json:"cpf,omitempty"`
	IsActive    bool   `json:"is_active,omitempty"`
	Permissions string `json:"permissions,omitempty"`
	Address     struct {
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
	// 1. Connect to database using the configuration
	dsn := config.GetDSN()
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run Migrations with explicit field specification
	fmt.Println("🔄 Running database migrations...")
	
	// First run AutoMigrate to handle standard fields
	if err := db.AutoMigrate(&models.User{}, &models.Basket{}, &models.Subscription{}, &models.Order{}); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}
	
	// Explicitly ensure admin fields are properly added
	adminFieldsMigrations := []string{
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions text",
	}
	
	for _, migration := range adminFieldsMigrations {
		if err := db.Exec(migration).Error; err != nil {
			log.Printf("⚠️ Migration warning: %v", err)
		}
	}
	
	fmt.Println("✅ Database schema updated successfully")

	// 2. Read seed data file
	absPath, _ := filepath.Abs("tools/data.json")
	fileContent, err := os.ReadFile(absPath)
	if err != nil {
		log.Fatal("Error reading data.json:", err)
	}

	var data JsonData
	if err := json.Unmarshal(fileContent, &data); err != nil {
		log.Fatal("Error parsing json:", err)
	}

	// 3. Seed the database
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
				CNPJ:          u.CNPJ,
				CPF:           u.CPF,
				IsActive:      u.IsActive,
				Permissions:   u.Permissions,
				AddressStreet: u.Address.Street,
				AddressNumber: u.Address.Number,
				AddressCity:   u.Address.City,
				AddressState:  u.Address.State,
				AddressZip:    u.Address.ZipCode,
			}
			// First check if the user exists by ID
			var existingUserById models.User
			resultById := tx.Where("id = ?", user.ID).First(&existingUserById)
			
			// Then check if user exists by email
			var existingUserByEmail models.User
			resultByEmail := tx.Where("email = ?", user.Email).First(&existingUserByEmail)
			
			if resultById.Error == nil {
				// User with this ID exists, update it
				if err := tx.Model(&existingUserById).Updates(map[string]interface{}{
					"email":          user.Email,
					"password":       user.Password,
					"role":           user.Role,
					"name":           user.Name,
					"cnpj":           user.CNPJ,
					"cpf":            user.CPF,
					"is_active":      user.IsActive,
					"permissions":    user.Permissions,
					"address_street": user.AddressStreet,
					"address_number": user.AddressNumber,
					"address_city":   user.AddressCity,
					"address_state":  user.AddressState,
					"address_zip":    user.AddressZip,
				}).Error; err != nil {
					return err
				}
			} else if resultByEmail.Error == nil {
				// User with this email exists but with different ID
				// Update existing user with new data but keep their original ID
				if err := tx.Model(&existingUserByEmail).Updates(map[string]interface{}{
					"role":           user.Role,
					"name":           user.Name,
					"password":       user.Password,
					"cnpj":           user.CNPJ,
					"cpf":            user.CPF,
					"is_active":      user.IsActive,
					"permissions":    user.Permissions,
					"address_street": user.AddressStreet,
					"address_number": user.AddressNumber,
					"address_city":   user.AddressCity,
					"address_state":  user.AddressState,
					"address_zip":    user.AddressZip,
				}).Error; err != nil {
					return err
				}
			} else if resultById.Error == gorm.ErrRecordNotFound && resultByEmail.Error == gorm.ErrRecordNotFound {
				// Neither ID nor email exists, create new user
				// Use Model field instead of ID to avoid setting sequence counters incorrectly
				if err := tx.Create(&user).Error; err != nil {
					log.Printf("Failed to create user %s: %v", user.Email, err)
					// Try again without the ID (let database assign it)
					user.Model = gorm.Model{}
					if err := tx.Create(&user).Error; err != nil {
						return err
					}
				}
			} else {
				// Other error occurred with one of the queries
				if resultById.Error != gorm.ErrRecordNotFound {
					return resultById.Error
				}
				return resultByEmail.Error
			}
		}
		fmt.Printf("✅ Seeded %d Users\n", len(data.Users))

		// Baskets
		for _, b := range data.Baskets {
			basket := models.Basket{
				Model:       gorm.Model{ID: b.ID},
				UserID:      b.SellerID,
				Name:        b.Name,
				Description: b.Description,
				Price:       b.Price,
			}
			// Check if the basket exists by ID
			var existingBasket models.Basket
			result := tx.Where("id = ?", basket.ID).First(&existingBasket)
			
			if result.Error == nil {
				// Basket exists, update it
				if err := tx.Model(&existingBasket).Updates(map[string]interface{}{
					"name":        basket.Name,
					"description": basket.Description,
					"price":       basket.Price,
					"user_id":     basket.UserID,
				}).Error; err != nil {
					return err
				}
			} else if result.Error == gorm.ErrRecordNotFound {
				// Basket doesn't exist, try to create it
				if err := tx.Create(&basket).Error; err != nil {
					log.Printf("Failed to create basket %s: %v", basket.Name, err)
					// Try again without the ID
					basket.Model = gorm.Model{}
					if err := tx.Create(&basket).Error; err != nil {
						return err
					}
				}
			} else {
				// Other error occurred with the query
				return result.Error
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
			// Check if the subscription exists by ID
			var existingSub models.Subscription
			result := tx.Where("id = ?", sub.ID).First(&existingSub)
			
			if result.Error == nil {
				// Subscription exists, update it
				if err := tx.Model(&existingSub).Updates(map[string]interface{}{
					"user_id":    sub.UserID,
					"basket_id":  sub.BasketID,
					"frequency":  sub.Frequency,
					"status":     sub.Status,
				}).Error; err != nil {
					return err
				}
			} else if result.Error == gorm.ErrRecordNotFound {
				// Subscription doesn't exist, try to create it
				if err := tx.Create(&sub).Error; err != nil {
					log.Printf("Failed to create subscription: %v", err)
					// Try again without the ID
					sub.Model = gorm.Model{}
					if err := tx.Create(&sub).Error; err != nil {
						return err
					}
				}
			} else {
				// Other error occurred with the query
				return result.Error
			}
		}
		fmt.Printf("✅ Seeded %d Subscriptions\n", len(data.Subscriptions))

		// Reset Postgres Auto-Increment Counters
		fmt.Println("🔧 Resetting ID sequences...")
		tables := []string{"users", "baskets", "subscriptions"}
		for _, table := range tables {
			sql := fmt.Sprintf("SELECT setval(pg_get_serial_sequence('%s', 'id'), coalesce(max(id)+1, 1), false) FROM %s;", table, table)
			if err := tx.Exec(sql).Error; err != nil {
				log.Printf("⚠️ Failed to reset sequence for %s: %v", table, err)
			}
		}

		return nil
	})
	
	fmt.Println("🚀 Seeding completed successfully!")
}