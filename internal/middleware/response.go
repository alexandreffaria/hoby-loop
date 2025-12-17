package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorResponse represents a standardized API error response
type ErrorResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// SuccessResponse represents a standardized API success response
type SuccessResponse struct {
	Status int         `json:"status"`
	Data   interface{} `json:"data"`
}

// ResponseMiddleware adds response helper methods to gin.Context
func ResponseMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Add success response helper
		c.Set("Success", func(data interface{}) {
			c.JSON(http.StatusOK, SuccessResponse{
				Status: http.StatusOK,
				Data:   data,
			})
		})

		// Add error response helper
		c.Set("Error", func(status int, message string, details string) {
			c.JSON(status, ErrorResponse{
				Status:  status,
				Message: message,
				Details: details,
			})
		})

		c.Next()
	}
}

// Success sends a standardized success response
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, SuccessResponse{
		Status: http.StatusOK,
		Data:   data,
	})
}

// Error sends a standardized error response
func Error(c *gin.Context, status int, message string, details string) {
	c.JSON(status, ErrorResponse{
		Status:  status,
		Message: message,
		Details: details,
	})
}

// BadRequest is a helper for 400 bad request errors
func BadRequest(c *gin.Context, message string, details string) {
	Error(c, http.StatusBadRequest, message, details)
}

// NotFound is a helper for 404 not found errors
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message, "")
}

// ServerError is a helper for 500 internal server errors
func ServerError(c *gin.Context, details string) {
	Error(c, http.StatusInternalServerError, "Internal server error", details)
}

// Unauthorized is a helper for 401 unauthorized errors
func Unauthorized(c *gin.Context) {
	Error(c, http.StatusUnauthorized, "Unauthorized", "")
}

// Forbidden is a helper for 403 forbidden errors
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message, "")
}