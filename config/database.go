package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// DBConfig holds the configuration for database connection
type DBConfig struct {
	Host            string
	User            string
	Password        string
	DBName          string
	Port            string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

// getEnv retrieves an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt retrieves an environment variable as int or returns a default value
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

// getEnvAsDuration retrieves an environment variable as duration or returns a default value
func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

// GetDBConfig returns the database configuration from environment variables
func GetDBConfig() DBConfig {
	return DBConfig{
		Host:            getEnv("DB_HOST", "localhost"),
		User:            getEnv("DB_USER", "hoby"),
		Password:        getEnv("DB_PASSWORD", "password123"),
		DBName:          getEnv("DB_NAME", "hobyloop"),
		Port:            getEnv("DB_PORT", "5433"),
		SSLMode:         getEnv("DB_SSLMODE", "disable"),
		MaxOpenConns:    getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
		MaxIdleConns:    getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
		ConnMaxLifetime: getEnvAsDuration("DB_CONN_MAX_LIFETIME", 5*time.Minute),
	}
}

// GetDSN returns the database connection string
func GetDSN() string {
	config := GetDBConfig()
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.SSLMode,
	)
}
