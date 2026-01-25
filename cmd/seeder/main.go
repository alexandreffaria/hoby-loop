package main

import (
	"fmt"
	"log"
	"time"

	"github.com/alexandreffaria/hoby-loop/config"
	"github.com/alexandreffaria/hoby-loop/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Connect to database
	dsn := config.GetDSN()
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("🔄 Dropping and recreating database schema...")

	// Drop all tables to start fresh
	if err := db.Migrator().DropTable(&models.Order{}, &models.Subscription{}, &models.Basket{}, &models.User{}); err != nil {
		log.Printf("⚠️ Warning dropping tables: %v", err)
	}

	// Run migrations to create tables
	if err := db.AutoMigrate(&models.User{}, &models.Basket{}, &models.Subscription{}, &models.Order{}); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	fmt.Println("✅ Database schema recreated successfully")

	// Seed the database with realistic demo data
	fmt.Println("🌱 Seeding database with demo data...")

	if err := seedDatabase(db); err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}

	fmt.Println("🚀 Seeding completed successfully!")
}

// seedDatabase creates all demo data in a transaction
func seedDatabase(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		// Step 1: Create Users
		users, err := createUsers(tx)
		if err != nil {
			return fmt.Errorf("failed to create users: %w", err)
		}
		fmt.Printf("✅ Created %d users (1 admin, 3 sellers, 5 consumers)\n", len(users))

		// Step 2: Create Baskets (Admin creates baskets for sellers - concierge model)
		baskets, err := createBaskets(tx, users)
		if err != nil {
			return fmt.Errorf("failed to create baskets: %w", err)
		}
		fmt.Printf("✅ Created %d baskets with different frequencies\n", len(baskets))

		// Step 3: Create Subscriptions (Consumers subscribe to baskets)
		subscriptions, err := createSubscriptions(tx, users, baskets)
		if err != nil {
			return fmt.Errorf("failed to create subscriptions: %w", err)
		}
		fmt.Printf("✅ Created %d active subscriptions\n", len(subscriptions))

		// Step 4: Create Orders (Mix of past, current, and future orders)
		orders, err := createOrders(tx, subscriptions)
		if err != nil {
			return fmt.Errorf("failed to create orders: %w", err)
		}
		fmt.Printf("✅ Created %d orders with various statuses\n", len(orders))

		return nil
	})
}

// createUsers creates admin, seller, and consumer users with realistic Brazilian data
func createUsers(tx *gorm.DB) (map[string]*models.User, error) {
	users := make(map[string]*models.User)

	// Admin User
	admin := &models.User{
		Name:          "Admin User",
		Email:         "admin@hobyloop.com",
		Password:      "admin123", // In production, this should be hashed
		Role:          "admin",
		IsActive:      true,
		Permissions:   `{"manage_users":true,"manage_baskets":true,"view_reports":true}`,
		AddressStreet: "Avenida Paulista",
		AddressNumber: "1578",
		AddressCity:   "São Paulo",
		AddressState:  "SP",
		AddressZip:    "01310-200",
	}
	if err := tx.Create(admin).Error; err != nil {
		return nil, err
	}
	users["admin"] = admin

	// Seller 1: Fazenda Orgânica Silva
	seller1 := &models.User{
		Name:          "Fazenda Orgânica Silva",
		Email:         "seller1@hobyloop.com",
		Password:      "seller123",
		Role:          "seller",
		CNPJ:          "12.345.678/0001-90",
		AddressStreet: "Estrada Municipal do Capuava",
		AddressNumber: "1250",
		AddressCity:   "Cotia",
		AddressState:  "SP",
		AddressZip:    "06709-015",
	}
	if err := tx.Create(seller1).Error; err != nil {
		return nil, err
	}
	users["seller1"] = seller1

	// Seller 2: Horta Urbana Santos
	seller2 := &models.User{
		Name:          "Horta Urbana Santos",
		Email:         "seller2@hobyloop.com",
		Password:      "seller123",
		Role:          "seller",
		CNPJ:          "23.456.789/0001-01",
		AddressStreet: "Rua da Consolação",
		AddressNumber: "3456",
		AddressCity:   "São Paulo",
		AddressState:  "SP",
		AddressZip:    "01416-001",
	}
	if err := tx.Create(seller2).Error; err != nil {
		return nil, err
	}
	users["seller2"] = seller2

	// Seller 3: Produtos Naturais Costa
	seller3 := &models.User{
		Name:          "Produtos Naturais Costa",
		Email:         "seller3@hobyloop.com",
		Password:      "seller123",
		Role:          "seller",
		CNPJ:          "34.567.890/0001-12",
		AddressStreet: "Avenida Brigadeiro Faria Lima",
		AddressNumber: "2927",
		AddressCity:   "São Paulo",
		AddressState:  "SP",
		AddressZip:    "01452-000",
	}
	if err := tx.Create(seller3).Error; err != nil {
		return nil, err
	}
	users["seller3"] = seller3

	// Consumer 1: Maria Silva
	consumer1 := &models.User{
		Name:          "Maria Silva Santos",
		Email:         "maria.silva@email.com",
		Password:      "consumer123",
		Role:          "consumer",
		CPF:           "123.456.789-01",
		AddressStreet: "Rua Augusta",
		AddressNumber: "1234",
		AddressCity:   "São Paulo",
		AddressState:  "SP",
		AddressZip:    "01305-100",
	}
	if err := tx.Create(consumer1).Error; err != nil {
		return nil, err
	}
	users["consumer1"] = consumer1

	// Consumer 2: João Oliveira
	consumer2 := &models.User{
		Name:          "João Oliveira Costa",
		Email:         "joao.oliveira@email.com",
		Password:      "consumer123",
		Role:          "consumer",
		CPF:           "234.567.890-12",
		AddressStreet: "Avenida Rebouças",
		AddressNumber: "3970",
		AddressCity:   "São Paulo",
		AddressState:  "SP",
		AddressZip:    "05402-600",
	}
	if err := tx.Create(consumer2).Error; err != nil {
		return nil, err
	}
	users["consumer2"] = consumer2

	// Consumer 3: Ana Paula
	consumer3 := &models.User{
		Name:          "Ana Paula Ferreira",
		Email:         "ana.ferreira@email.com",
		Password:      "consumer123",
		Role:          "consumer",
		CPF:           "345.678.901-23",
		AddressStreet: "Rua Oscar Freire",
		AddressNumber: "2500",
		AddressCity:   "São Paulo",
		AddressState:  "SP",
		AddressZip:    "01426-001",
	}
	if err := tx.Create(consumer3).Error; err != nil {
		return nil, err
	}
	users["consumer3"] = consumer3

	// Consumer 4: Carlos Eduardo
	consumer4 := &models.User{
		Name:          "Carlos Eduardo Souza",
		Email:         "carlos.souza@email.com",
		Password:      "consumer123",
		Role:          "consumer",
		CPF:           "456.789.012-34",
		AddressStreet: "Rua dos Pinheiros",
		AddressNumber: "1500",
		AddressCity:   "São Paulo",
		AddressState:  "SP",
		AddressZip:    "05422-001",
	}
	if err := tx.Create(consumer4).Error; err != nil {
		return nil, err
	}
	users["consumer4"] = consumer4

	// Consumer 5: Beatriz Lima
	consumer5 := &models.User{
		Name:          "Beatriz Lima Rodrigues",
		Email:         "beatriz.lima@email.com",
		Password:      "consumer123",
		Role:          "consumer",
		CPF:           "567.890.123-45",
		AddressStreet: "Avenida Ibirapuera",
		AddressNumber: "3103",
		AddressCity:   "São Paulo",
		AddressState:  "SP",
		AddressZip:    "04029-902",
	}
	if err := tx.Create(consumer5).Error; err != nil {
		return nil, err
	}
	users["consumer5"] = consumer5

	return users, nil
}

// createBaskets creates baskets for sellers with different frequencies
// Note: In the concierge model, admin creates baskets for sellers
func createBaskets(tx *gorm.DB, users map[string]*models.User) ([]*models.Basket, error) {
	baskets := []*models.Basket{
		// Seller 1 Baskets (Fazenda Orgânica Silva)
		{
			UserID:      users["seller1"].ID,
			Name:        "Cesta Semanal de Verduras",
			Description: "Verduras frescas e orgânicas colhidas semanalmente. Inclui alface, rúcula, couve, espinafre e temperos verdes.",
			Price:       45.00,
			Frequency:   "weekly",
		},
		{
			UserID:      users["seller1"].ID,
			Name:        "Cesta Quinzenal Mista",
			Description: "Mix de verduras, legumes e frutas orgânicas. Variedade sazonal garantida a cada quinzena.",
			Price:       85.00,
			Frequency:   "biweekly",
		},
		{
			UserID:      users["seller1"].ID,
			Name:        "Cesta Mensal Premium",
			Description: "Seleção premium de produtos orgânicos incluindo verduras, legumes, frutas e ovos caipiras.",
			Price:       120.00,
			Frequency:   "monthly",
		},

		// Seller 2 Baskets (Horta Urbana Santos)
		{
			UserID:      users["seller2"].ID,
			Name:        "Frutas Frescas Semanais",
			Description: "Frutas da estação colhidas no ponto ideal de maturação. Variedade de 5-6 tipos diferentes.",
			Price:       55.00,
			Frequency:   "weekly",
		},
		{
			UserID:      users["seller2"].ID,
			Name:        "Hortifruti Quinzenal",
			Description: "Combinação balanceada de frutas e verduras frescas, ideal para famílias pequenas.",
			Price:       75.00,
			Frequency:   "biweekly",
		},

		// Seller 3 Baskets (Produtos Naturais Costa)
		{
			UserID:      users["seller3"].ID,
			Name:        "Orgânicos do Mês",
			Description: "Cesta mensal completa com produtos orgânicos certificados: verduras, legumes, frutas e grãos.",
			Price:       95.00,
			Frequency:   "monthly",
		},
		{
			UserID:      users["seller3"].ID,
			Name:        "Cesta Semanal Básica",
			Description: "Essenciais da semana: tomate, cebola, batata, cenoura, alface e frutas variadas.",
			Price:       35.00,
			Frequency:   "weekly",
		},
		{
			UserID:      users["seller3"].ID,
			Name:        "Cesta Quinzenal Família",
			Description: "Cesta generosa para famílias, com grande variedade de produtos frescos e orgânicos.",
			Price:       110.00,
			Frequency:   "biweekly",
		},
	}

	for _, basket := range baskets {
		if err := tx.Create(basket).Error; err != nil {
			return nil, err
		}
	}

	return baskets, nil
}

// createSubscriptions creates subscriptions for consumers with calculated NextDeliveryDate
func createSubscriptions(tx *gorm.DB, users map[string]*models.User, baskets []*models.Basket) ([]*models.Subscription, error) {
	now := time.Now()
	subscriptions := []*models.Subscription{
		// Consumer 1: Maria Silva - 2 subscriptions
		{
			UserID:           users["consumer1"].ID,
			BasketID:         baskets[0].ID, // Cesta Semanal de Verduras
			Frequency:        "weekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 7), // Next week
		},
		{
			UserID:           users["consumer1"].ID,
			BasketID:         baskets[3].ID, // Frutas Frescas Semanais
			Frequency:        "weekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 7),
		},

		// Consumer 2: João Oliveira - 2 subscriptions
		{
			UserID:           users["consumer2"].ID,
			BasketID:         baskets[1].ID, // Cesta Quinzenal Mista
			Frequency:        "biweekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 14), // In 2 weeks
		},
		{
			UserID:           users["consumer2"].ID,
			BasketID:         baskets[6].ID, // Cesta Semanal Básica
			Frequency:        "weekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 7),
		},

		// Consumer 3: Ana Paula - 3 subscriptions
		{
			UserID:           users["consumer3"].ID,
			BasketID:         baskets[2].ID, // Cesta Mensal Premium
			Frequency:        "monthly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 30), // In 30 days
		},
		{
			UserID:           users["consumer3"].ID,
			BasketID:         baskets[4].ID, // Hortifruti Quinzenal
			Frequency:        "biweekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 14),
		},
		{
			UserID:           users["consumer3"].ID,
			BasketID:         baskets[0].ID, // Cesta Semanal de Verduras
			Frequency:        "weekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 7),
		},

		// Consumer 4: Carlos Eduardo - 2 subscriptions
		{
			UserID:           users["consumer4"].ID,
			BasketID:         baskets[5].ID, // Orgânicos do Mês
			Frequency:        "monthly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 30),
		},
		{
			UserID:           users["consumer4"].ID,
			BasketID:         baskets[7].ID, // Cesta Quinzenal Família
			Frequency:        "biweekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 14),
		},

		// Consumer 5: Beatriz Lima - 2 subscriptions
		{
			UserID:           users["consumer5"].ID,
			BasketID:         baskets[3].ID, // Frutas Frescas Semanais
			Frequency:        "weekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 7),
		},
		{
			UserID:           users["consumer5"].ID,
			BasketID:         baskets[1].ID, // Cesta Quinzenal Mista
			Frequency:        "biweekly",
			Status:           "active",
			NextDeliveryDate: now.AddDate(0, 0, 14),
		},
	}

	for _, subscription := range subscriptions {
		if err := tx.Create(subscription).Error; err != nil {
			return nil, err
		}
	}

	return subscriptions, nil
}

// createOrders creates orders with realistic dates and statuses
// Mix of past (delivered), current (preparing/shipped), and future (pending) orders
func createOrders(tx *gorm.DB, subscriptions []*models.Subscription) ([]*models.Order, error) {
	now := time.Now()
	var orders []*models.Order

	// For each subscription, create multiple orders to show history
	for i, subscription := range subscriptions {
		var subscriptionOrders []*models.Order

		// Determine how many past orders based on frequency
		pastOrderCount := 0
		switch subscription.Frequency {
		case "weekly":
			pastOrderCount = 4 // 4 weeks of history
		case "biweekly":
			pastOrderCount = 3 // 6 weeks of history
		case "monthly":
			pastOrderCount = 2 // 2 months of history
		}

		// Create past orders (delivered)
		for j := pastOrderCount; j > 0; j-- {
			var scheduledDate time.Time
			switch subscription.Frequency {
			case "weekly":
				scheduledDate = now.AddDate(0, 0, -7*j)
			case "biweekly":
				scheduledDate = now.AddDate(0, 0, -14*j)
			case "monthly":
				scheduledDate = now.AddDate(0, 0, -30*j)
			}

			deliveredAt := scheduledDate.AddDate(0, 0, 1) // Delivered 1 day after scheduled
			shippedAt := scheduledDate.AddDate(0, 0, -1)  // Shipped 1 day before scheduled

			order := &models.Order{
				SubscriptionID: subscription.ID,
				Status:         "delivered",
				ScheduledDate:  scheduledDate,
				TrackingCode:   fmt.Sprintf("BR%d%03d%02d", now.Year(), i*10+j, j),
				ShippedAt:      &shippedAt,
				DeliveredAt:    &deliveredAt,
			}
			subscriptionOrders = append(subscriptionOrders, order)
		}

		// Create current order (preparing or shipped)
		currentScheduledDate := now.AddDate(0, 0, 2) // Scheduled for 2 days from now
		currentStatus := "preparing"
		var currentShippedAt *time.Time
		trackingCode := ""

		// Some orders are already shipped
		if i%3 == 0 {
			currentStatus = "shipped"
			shipped := now.AddDate(0, 0, -1) // Shipped yesterday
			currentShippedAt = &shipped
			trackingCode = fmt.Sprintf("BR%d%03d00", now.Year(), i*10)
		}

		currentOrder := &models.Order{
			SubscriptionID: subscription.ID,
			Status:         currentStatus,
			ScheduledDate:  currentScheduledDate,
			TrackingCode:   trackingCode,
			ShippedAt:      currentShippedAt,
		}
		subscriptionOrders = append(subscriptionOrders, currentOrder)

		// Create future order (pending) - this is the NextDeliveryDate order
		futureOrder := &models.Order{
			SubscriptionID: subscription.ID,
			Status:         "pending",
			ScheduledDate:  subscription.NextDeliveryDate,
			TrackingCode:   "",
		}
		subscriptionOrders = append(subscriptionOrders, futureOrder)

		// Add all orders for this subscription
		orders = append(orders, subscriptionOrders...)
	}

	// Create all orders in database
	for _, order := range orders {
		if err := tx.Create(order).Error; err != nil {
			return nil, err
		}
	}

	return orders, nil
}
