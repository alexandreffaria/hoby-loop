package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
    "github.com/gin-contrib/cors"

    "github.com/alexandreffaria/hoby-loop/models"
)

// Global DB variable so we can use it everywhere
var DB *gorm.DB

func ConnectDatabase() {
	// 1. Define the connection string (DSN)
    dsn := "host=localhost user=hoby password=password123 dbname=hobyloop port=5433 sslmode=disable"
    // 2. Connect to the database

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Migrate the schema
	// This creates/updates tables automatically
	err = database.AutoMigrate(&models.User{}, &models.Basket{}, &models.Subscription{}, &models.Order{})
	if err != nil {
		log.Fatal("Migration failed: ", err)
	}

	DB = database
	fmt.Println("🚀 Database connected and migrated successfully!")
}

func main() {
	// Connect to DB first
	ConnectDatabase()

	r := gin.Default()

    // Configure CORS to allow the frontend to talk to us
config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
			"db":      "connected",
		})
	})

    r.POST("/baskets", CreateBasket)

    r.POST("/subscriptions", CreateSubscription)

    r.GET("/sellers/:id/subscriptions", GetSellerSubscriptions)

    r.POST("/orders", CreateOrder)

    r.GET("/baskets/:id", GetBasket)

	r.Run(":8080")
}