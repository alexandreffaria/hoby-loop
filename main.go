package main

import (
	"log"

	"github.com/alexandreffaria/hoby-loop/internal/database"
	"github.com/alexandreffaria/hoby-loop/internal/routes"
)

func main() {
	// Initialize database connection
	database.Initialize()

	// Setup router with all routes
	r := routes.SetupRouter()

	// Start the server
	log.Println("🚀 Server starting on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}