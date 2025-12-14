package config

// DBConfig holds the configuration for database connection
type DBConfig struct {
	Host     string
	User     string
	Password string
	DBName   string
	Port     string
	SSLMode  string
}

// GetDBConfig returns the database configuration
func GetDBConfig() DBConfig {
	return DBConfig{
		Host:     "localhost",
		User:     "hoby",
		Password: "password123",
		DBName:   "hobyloop",
		Port:     "5433",
		SSLMode:  "disable",
	}
}

// GetDSN returns the database connection string
func GetDSN() string {
	config := GetDBConfig()
	return "host=" + config.Host +
		" user=" + config.User +
		" password=" + config.Password +
		" dbname=" + config.DBName +
		" port=" + config.Port +
		" sslmode=" + config.SSLMode
}