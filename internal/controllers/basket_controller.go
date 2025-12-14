package controllers

import (
	"github.com/alexandreffaria/hoby-loop/internal/database"
	"github.com/alexandreffaria/hoby-loop/internal/middleware"
	"github.com/alexandreffaria/hoby-loop/models"
	"github.com/gin-gonic/gin"
)

// CreateBasketInput defines request structure for creating a basket
type CreateBasketInput struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	SellerID    uint    `json:"seller_id" binding:"required"`
}

// CreateBasket handles the creation of a new basket
func CreateBasket(c *gin.Context) {
	var input CreateBasketInput

	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Invalid basket data", err.Error())
		return
	}

	basket := models.Basket{
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		UserID:      input.SellerID,
	}

	if err := database.DB.Create(&basket).Error; err != nil {
		middleware.ServerError(c, "Failed to create basket: "+err.Error())
		return
	}

	middleware.Success(c, basket)
}

// GetBasket fetches a single basket by ID
func GetBasket(c *gin.Context) {
	id := c.Param("id")
	var basket models.Basket

	if err := database.DB.First(&basket, id).Error; err != nil {
		middleware.NotFound(c, "Basket not found")
		return
	}

	middleware.Success(c, basket)
}

// GetSellerBaskets retrieves all baskets created by a seller
func GetSellerBaskets(c *gin.Context) {
	sellerID := c.Param("id")
	var baskets []models.Basket

	if err := database.DB.Where("user_id = ?", sellerID).Find(&baskets).Error; err != nil {
		middleware.ServerError(c, "Failed to fetch baskets: "+err.Error())
		return
	}

	middleware.Success(c, baskets)
}