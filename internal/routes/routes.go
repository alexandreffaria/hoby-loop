package routes

import (
	"github.com/alexandreffaria/hoby-loop/internal/controllers"
	"github.com/alexandreffaria/hoby-loop/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter configures all API routes
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Apply response middleware
	r.Use(middleware.ResponseMiddleware())

	// Health check
	r.GET("/ping", func(c *gin.Context) {
		middleware.Success(c, map[string]string{
			"message": "pong",
			"status":  "ok",
		})
	})

	// Auth routes
	r.POST("/login", controllers.Login)
	
	// User routes
	r.PUT("/users/:id", controllers.UpdateUser)
	
	// Basket routes
	r.POST("/baskets", controllers.CreateBasket)
	r.GET("/baskets/:id", controllers.GetBasket)
	r.GET("/sellers/:id/baskets", controllers.GetSellerBaskets)
	
	// Subscription routes
	r.POST("/subscriptions", controllers.CreateSubscription)
	r.GET("/sellers/:id/subscriptions", controllers.GetSellerSubscriptions)
	r.GET("/users/:id/subscriptions", controllers.GetConsumerSubscriptions)
	
	// Order routes
	r.POST("/orders", controllers.CreateOrder)

	return r
}