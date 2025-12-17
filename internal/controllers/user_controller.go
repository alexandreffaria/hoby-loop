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