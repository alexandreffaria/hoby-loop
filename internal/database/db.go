package database

import (
	"database/sql"
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

	// Get database configuration
	dbConfig := config.GetDBConfig()
	dsn := config.GetDSN()

	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Get underlying SQL database for connection pool configuration
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to get database instance: ", err)
	}

	// Configure connection pool
	sqlDB.SetMaxOpenConns(dbConfig.MaxOpenConns)
	sqlDB.SetMaxIdleConns(dbConfig.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(dbConfig.ConnMaxLifetime)

	// Test the connection
	if err := sqlDB.Ping(); err != nil {
		log.Fatal("Failed to ping database: ", err)
	}

	log.Printf("📊 Database connection pool configured: MaxOpen=%d, MaxIdle=%d, MaxLifetime=%v",
		dbConfig.MaxOpenConns, dbConfig.MaxIdleConns, dbConfig.ConnMaxLifetime)

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

// Close closes the database connection
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// GetStats returns database connection pool statistics
func GetStats() sql.DBStats {
	sqlDB, _ := DB.DB()
	return sqlDB.Stats()
}
