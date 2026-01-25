package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/alexandreffaria/hoby-loop/internal/database"
	"github.com/alexandreffaria/hoby-loop/internal/routes"
)

func main() {
	// Initialize database connection
	log.Println("🔌 Initializing database connection...")
	database.Initialize()

	// Setup router with all routes
	log.Println("🛣️  Setting up routes...")
	r := routes.SetupRouter()

	// Get server port from environment variable
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("🚀 Server starting on http://localhost:%s", port)
		log.Printf("📊 Environment: %s", os.Getenv("GIN_MODE"))
		log.Printf("🏥 Health check: http://localhost:%s/ping", port)

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	// Create shutdown context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("⚠️  Server forced to shutdown: %v", err)
	}

	// Close database connection
	if err := database.Close(); err != nil {
		log.Printf("⚠️  Error closing database: %v", err)
	}

	log.Println("✅ Server stopped gracefully")
	fmt.Println("👋 Goodbye!")
}
