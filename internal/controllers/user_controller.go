package controllers

import (
	"github.com/alexandreffaria/hoby-loop/internal/database"
	"github.com/alexandreffaria/hoby-loop/internal/middleware"
	"github.com/alexandreffaria/hoby-loop/models"
	"github.com/gin-gonic/gin"
)

// Login authenticates a user by email
func Login(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Valid email is required", err.Error())
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		middleware.Unauthorized(c)
		return
	}

	middleware.Success(c, user)
}

// UpdateUser handles user profile updates
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	// Find the user
	if err := database.DB.First(&user, id).Error; err != nil {
		middleware.NotFound(c, "User not found")
		return
	}

	// Bind the new data
	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Invalid input data", err.Error())
		return
	}

	// Update fields
	updates := models.User{
		Name:          input.Name,
		Email:         input.Email,
		CNPJ:          input.CNPJ,
		CPF:           input.CPF,
		AddressStreet: input.AddressStreet,
		AddressNumber: input.AddressNumber,
		AddressCity:   input.AddressCity,
		AddressState:  input.AddressState,
		AddressZip:    input.AddressZip,
	}
	
	if err := database.DB.Model(&user).Updates(updates).Error; err != nil {
		middleware.ServerError(c, err.Error())
		return
	}

	middleware.Success(c, user)
}

// RegisterUser handles user registration (both seller and consumer)
func RegisterUser(c *gin.Context) {
	var input struct {
		Email         string `json:"email" binding:"required,email"`
		Name          string `json:"name" binding:"required"`
		Role          string `json:"role" binding:"required,oneof=seller consumer"`
		CNPJ          string `json:"cnpj"`
		CPF           string `json:"cpf"`
		AddressStreet string `json:"address_street" binding:"required"`
		AddressCity   string `json:"address_city"`
		AddressState  string `json:"address_state"`
		AddressZip    string `json:"address_zip"`
		AddressNumber string `json:"address_number"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Invalid input data", err.Error())
		return
	}

	// Validate role-specific required fields
	if input.Role == "seller" && input.CNPJ == "" {
		middleware.BadRequest(c, "CNPJ is required for seller accounts", nil)
		return
	}

	if input.Role == "consumer" && input.CPF == "" {
		middleware.BadRequest(c, "CPF is required for consumer accounts", nil)
		return
	}

	// Check if email already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		middleware.BadRequest(c, "Email already in use", nil)
		return
	}

	// Create new user
	user := models.User{
		Email:         input.Email,
		Name:          input.Name,
		Role:          input.Role,
		CNPJ:          input.CNPJ,
		CPF:           input.CPF,
		AddressStreet: input.AddressStreet,
		AddressCity:   input.AddressCity,
		AddressState:  input.AddressState,
		AddressZip:    input.AddressZip,
		AddressNumber: input.AddressNumber,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		middleware.ServerError(c, err.Error())
		return
	}

	middleware.Success(c, user)
}