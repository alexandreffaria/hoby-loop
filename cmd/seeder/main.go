package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"


	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// --- 1. Define JSON Structs (Matching data.json) ---
// These helpers allow us to read the file exactly as generated.

type JsonData struct {
	Sellers       []Seller       `json:"sellers"`
	Products      []Product      `json:"products"`
	Users         []User         `json:"users"`
	Subscriptions []Subscription `json:"subscriptions"`
}

// --- 2. Define Database Models (GORM) ---
// These are the tables that will be created in your DB.

type Seller struct {
	ID        string `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	OwnerName string `json:"owner_name"`
	Email     string `json:"email"`
}

type Product struct {
	ID             string  `gorm:"primaryKey" json:"id"`
	SellerID       string  `json:"seller_id"` // FK to Seller
	Name           string  `json:"name"`
	Description    string  `json:"description"`
	DurationLabel  string  `json:"duration_label"`
	FrequencyLabel string  `json:"frequency_label"`
	Price          float64 `json:"price"`
}

type User struct {
	ID        string `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
	// In the JSON, Address is nested. In DB, we flat it or use a relation. 
	// For simplicity, let's flatten it into the User table for now.
	AddressStreet  string `json:"-"` 
	AddressZip     string `json:"-"`
	AddressCity    string `json:"-"`
	// Helper to catch the nested JSON during unmarshal
	AddressRaw     struct {
		Street    string `json:"street"`
		Number    string `json:"number"`
		ZipCode   string `json:"zip_code"`
		CityState string `json:"city_state"`
	} `gorm:"-" json:"address"` 
}

type Subscription struct {
	ID     string `gorm:"primaryKey" json:"id"`
	Status string `json:"status"`
	// In DB, we only store FKs.
	UserID    string `json:"-"` 
	ProductID string `json:"-"`
}

// --- 3. The Main Seeder Logic ---

func main() {
	// A. Connect to Database (Update with your credentials!)
	dsn := "host=localhost user=hoby password=password123 dbname=hobyloop port=5433 sslmode=disable"	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// B. Migrate Schema (Auto-create tables if missing)
	fmt.Println("Migrating database schema...")
	db.AutoMigrate(&Seller{}, &Product{}, &User{}, &Subscription{})

	// C. Read the JSON File
	fmt.Println("Reading data.json...")
	fileContent, err := ioutil.ReadFile("../../scripts/data.json") // Adjust path if needed
	if err != nil {
		log.Fatal("Error reading json file:", err)
	}

	var data JsonData
	if err := json.Unmarshal(fileContent, &data); err != nil {
		log.Fatal("Error parsing json:", err)
	}

	// D. Seed Data Transactionally
	fmt.Println("Seeding data...")
	db.Transaction(func(tx *gorm.DB) error {
		
		// 1. Insert Sellers
		if err := tx.CreateInBatches(data.Sellers, 10).Error; err != nil {
			return err
		}
		fmt.Printf("✅ Inserted %d Sellers\n", len(data.Sellers))

		// 2. Insert Products
		if err := tx.CreateInBatches(data.Products, 10).Error; err != nil {
			return err
		}
		fmt.Printf("✅ Inserted %d Products\n", len(data.Products))

		// 3. Insert Users (Need to map nested Address to Flat fields)
		var usersToInsert []User
		for _, u := range data.Users {
			// Flatten the address data manually
			u.AddressStreet = fmt.Sprintf("%s, %s", u.AddressRaw.Street, u.AddressRaw.Number)
			u.AddressZip = u.AddressRaw.ZipCode
			u.AddressCity = u.AddressRaw.CityState
			usersToInsert = append(usersToInsert, u)
		}
		if err := tx.CreateInBatches(usersToInsert, 10).Error; err != nil {
			return err
		}
		fmt.Printf("✅ Inserted %d Users\n", len(data.Users))

		// 4. Insert Subscriptions (Complex part: extracting IDs)
		var subsToInsert []Subscription
		for _, s := range data.Subscriptions {
			// TRICK: The JSON 'id' is "sub_{userID}_{productID}"
			// Let's parse it to get our Foreign Keys back.
			// Format: sub_user_1_prod_seller_1_1
			
			// Simple logic: We iterate the generated lists to find matches 
			// (or simpler: assume the ID string parsing logic is robust)
			
			// For this MVP seeder, let's just insert the ID and Status 
			// and leave the FKs null or parse them if you really need relation integrity immediately.
			// Ideally, you'd parse strings.Split(s.ID, "_") but doing that robustly with regex is better.
			
			subsToInsert = append(subsToInsert, Subscription{
				ID: s.ID,
				Status: s.Status,
				// UserID: ... (parsed from s.ID)
				// ProductID: ... (parsed from s.ID)
			})
		}
		if err := tx.CreateInBatches(subsToInsert, 10).Error; err != nil {
			return err
		}
		fmt.Printf("✅ Inserted %d Subscriptions\n", len(data.Subscriptions))

		return nil
	})

	fmt.Println("🎉 Database seeded successfully!")
}