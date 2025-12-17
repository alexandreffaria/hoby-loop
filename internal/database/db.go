package database

import (
	"fmt"
	"log"

	"github.com/alexandreffaria/hoby-loop/config"
	"github.com/alexandreffaria/hoby-loop/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB is the global database instance
var DB *gorm.DB

// Initialize connects to the database and performs migrations
func Initialize() {
	var err error

	// Get database connection string from config
	dsn := config.GetDSN()
	
	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Migrate the schema
	fmt.Println("🔄 Running database migrations...")
	
	// First run AutoMigrate for standard fields
	err = DB.AutoMigrate(&models.User{}, &models.Basket{}, &models.Subscription{}, &models.Order{})
	if err != nil {
		log.Fatal("Migration failed: ", err)
	}
	
	// Explicitly ensure admin fields exist
	adminFieldsMigrations := []string{
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions text",
	}
	
	for _, migration := range adminFieldsMigrations {
		if err := DB.Exec(migration).Error; err != nil {
			log.Printf("⚠️ Admin field migration warning: %v", err)
		}
	}

	fmt.Println("🚀 Database connected and migrated successfully!")
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}