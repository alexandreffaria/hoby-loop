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
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "X-User-ID"}
	r.Use(cors.New(config))

	// Apply response and auth middleware
	r.Use(middleware.ResponseMiddleware())
	r.Use(middleware.AuthMiddleware())

	// Health check
	r.GET("/ping", func(c *gin.Context) {
		middleware.Success(c, map[string]string{
			"message": "pong",
			"status":  "ok",
		})
	})

	// Auth routes
	r.POST("/login", controllers.Login)
	r.POST("/register", controllers.RegisterUser)

	// User routes
	r.PUT("/users/:id", controllers.UpdateUser)
	r.GET("/users", controllers.GetAllUsers) // For fetching sellers in admin panel

	// Basket routes
	r.GET("/baskets/:id", controllers.GetBasket)
	r.GET("/sellers/:id/baskets", controllers.GetSellerBaskets)

	// Subscription routes
	r.POST("/subscriptions", controllers.CreateSubscription)
	r.GET("/sellers/:id/subscriptions", controllers.GetSellerSubscriptions)
	r.GET("/consumers/:id/subscriptions", controllers.GetConsumerSubscriptions)

	// Order routes
	r.POST("/orders", controllers.CreateOrder)
	r.GET("/subscriptions/:id/orders", controllers.GetSubscriptionOrders)
	r.GET("/baskets/:id/orders", controllers.GetBasketOrders)
	r.GET("/consumers/:id/orders", controllers.GetOrdersByConsumer)
	r.GET("/sellers/:id/orders", controllers.GetOrdersBySeller)
	r.PUT("/orders/:id/status", controllers.UpdateOrderStatus)
	r.GET("/orders/:id", controllers.GetOrder)

	// Admin routes with authentication
	admin := r.Group("/admin")
	admin.Use(middleware.RequireAdmin())
	{
		admin.GET("/users", controllers.GetAllUsers)
		admin.GET("/subscriptions", controllers.GetAllSubscriptions)
		admin.GET("/baskets", controllers.GetAllBaskets)
		admin.POST("/baskets", controllers.CreateBasket)
	}

	return r
}
