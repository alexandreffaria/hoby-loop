# Hoby Loop MVP - Implementation Checklist

This checklist provides a step-by-step guide for implementing all required changes to meet MVP requirements.

## 🔴 Critical Fixes (Must Do First)

### ✅ Fix 1: API Endpoint Inconsistency
**Priority:** CRITICAL - Application is currently broken

**File:** [`internal/routes/routes.go`](../internal/routes/routes.go:48)

**Current:**
```go
r.GET("/users/:id/subscriptions", controllers.GetConsumerSubscriptions)
```

**Change to:**
```go
r.GET("/consumers/:id/subscriptions", controllers.GetConsumerSubscriptions)
```

**Reason:** Frontend calls `/consumers/:id/subscriptions` but backend expects `/users/:id/subscriptions`

---

## 🟡 Phase 1: Backend Core Enhancements

### Task 1.1: Create CPF/CNPJ Validator

**New File:** `internal/validators/document_validator.go`

**Implementation:**
```go
package validators

import (
	"regexp"
	"strconv"
)

// ValidateCPF validates Brazilian CPF (Cadastro de Pessoas Físicas)
func ValidateCPF(cpf string) bool {
	// Remove non-numeric characters
	cpf = regexp.MustCompile(`\D`).ReplaceAllString(cpf, "")
	
	// Check length
	if len(cpf) != 11 {
		return false
	}
	
	// Check for known invalid CPFs (all same digits)
	allSame := true
	for i := 1; i < len(cpf); i++ {
		if cpf[i] != cpf[0] {
			allSame = false
			break
		}
	}
	if allSame {
		return false
	}
	
	// Calculate first verification digit
	sum := 0
	for i := 0; i < 9; i++ {
		num, _ := strconv.Atoi(string(cpf[i]))
		sum += num * (10 - i)
	}
	digit1 := (sum * 10) % 11
	if digit1 == 10 {
		digit1 = 0
	}
	
	// Calculate second verification digit
	sum = 0
	for i := 0; i < 10; i++ {
		num, _ := strconv.Atoi(string(cpf[i]))
		sum += num * (11 - i)
	}
	digit2 := (sum * 10) % 11
	if digit2 == 10 {
		digit2 = 0
	}
	
	// Verify digits
	d1, _ := strconv.Atoi(string(cpf[9]))
	d2, _ := strconv.Atoi(string(cpf[10]))
	
	return d1 == digit1 && d2 == digit2
}

// ValidateCNPJ validates Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
func ValidateCNPJ(cnpj string) bool {
	// Remove non-numeric characters
	cnpj = regexp.MustCompile(`\D`).ReplaceAllString(cnpj, "")
	
	// Check length
	if len(cnpj) != 14 {
		return false
	}
	
	// Check for known invalid CNPJs (all same digits)
	allSame := true
	for i := 1; i < len(cnpj); i++ {
		if cnpj[i] != cnpj[0] {
			allSame = false
			break
		}
	}
	if allSame {
		return false
	}
	
	// Calculate first verification digit
	weights1 := []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum := 0
	for i := 0; i < 12; i++ {
		num, _ := strconv.Atoi(string(cnpj[i]))
		sum += num * weights1[i]
	}
	digit1 := sum % 11
	if digit1 < 2 {
		digit1 = 0
	} else {
		digit1 = 11 - digit1
	}
	
	// Calculate second verification digit
	weights2 := []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum = 0
	for i := 0; i < 13; i++ {
		num, _ := strconv.Atoi(string(cnpj[i]))
		sum += num * weights2[i]
	}
	digit2 := sum % 11
	if digit2 < 2 {
		digit2 = 0
	} else {
		digit2 = 11 - digit2
	}
	
	// Verify digits
	d1, _ := strconv.Atoi(string(cnpj[12]))
	d2, _ := strconv.Atoi(string(cnpj[13]))
	
	return d1 == digit1 && d2 == digit2
}

// FormatCPF formats CPF to XXX.XXX.XXX-XX
func FormatCPF(cpf string) string {
	cpf = regexp.MustCompile(`\D`).ReplaceAllString(cpf, "")
	if len(cpf) != 11 {
		return cpf
	}
	return cpf[0:3] + "." + cpf[3:6] + "." + cpf[6:9] + "-" + cpf[9:11]
}

// FormatCNPJ formats CNPJ to XX.XXX.XXX/XXXX-XX
func FormatCNPJ(cnpj string) string {
	cnpj = regexp.MustCompile(`\D`).ReplaceAllString(cnpj, "")
	if len(cnpj) != 14 {
		return cnpj
	}
	return cnpj[0:2] + "." + cnpj[2:5] + "." + cnpj[5:8] + "/" + cnpj[8:12] + "-" + cnpj[12:14]
}
```

---

### Task 1.2: Update User Model with Validation

**File:** [`models/models.go`](../models/models.go:8)

**Changes:**
1. Add unique constraints to CPF and CNPJ
2. Add indexes for performance

**Updated User struct:**
```go
type User struct {
	gorm.Model
	Email         string `json:"email" gorm:"unique;index"`
	Password      string `json:"-"`
	Role          string `json:"role" gorm:"index"`
	Name          string `json:"name"`
	
	// Business identification fields with validation
	CNPJ          string `json:"cnpj,omitempty" gorm:"unique;index"`
	CPF           string `json:"cpf,omitempty" gorm:"unique;index"`
	
	// Admin-specific fields
	IsActive      bool   `json:"is_active" gorm:"default:true"`
	Permissions   string `json:"permissions,omitempty"`
	
	// Address fields
	AddressStreet string `json:"address_street"`
	AddressNumber string `json:"address_number"`
	AddressCity   string `json:"address_city"`
	AddressState  string `json:"address_state"`
	AddressZip    string `json:"address_zip"`
}
```

---

### Task 1.3: Enhance Order Model

**File:** [`models/models.go`](../models/models.go:52)

**Add import:**
```go
import (
	"time"
	"gorm.io/gorm"
)
```

**Updated Order struct:**
```go
type Order struct {
	gorm.Model
	SubscriptionID uint         `json:"subscription_id" gorm:"index"`
	Subscription   Subscription `json:"subscription,omitempty" gorm:"foreignKey:SubscriptionID"`
	Status         string       `json:"status" gorm:"default:'preparing'"` // "preparing", "shipped", "delivered"
	TrackingCode   string       `json:"tracking_code,omitempty"`
	ShippedAt      *time.Time   `json:"shipped_at,omitempty"`
	DeliveredAt    *time.Time   `json:"delivered_at,omitempty"`
}
```

---

### Task 1.4: Update User Controller with Validation

**File:** [`internal/controllers/user_controller.go`](../internal/controllers/user_controller.go:1)

**Add validation in RegisterUser and UpdateUser functions:**

```go
import (
	"github.com/alexandreffaria/hoby-loop/internal/validators"
)

// In RegisterUser function, add validation before creating user:
if input.Role == "consumer" && input.CPF != "" {
	if !validators.ValidateCPF(input.CPF) {
		middleware.BadRequest(c, "Invalid CPF format", "CPF validation failed")
		return
	}
	// Format CPF before saving
	input.CPF = validators.FormatCPF(input.CPF)
}

if input.Role == "seller" && input.CNPJ != "" {
	if !validators.ValidateCNPJ(input.CNPJ) {
		middleware.BadRequest(c, "Invalid CNPJ format", "CNPJ validation failed")
		return
	}
	// Format CNPJ before saving
	input.CNPJ = validators.FormatCNPJ(input.CNPJ)
}
```

---

### Task 1.5: Add Order Management Endpoints

**File:** [`internal/controllers/order_controller.go`](../internal/controllers/order_controller.go:1)

**Add new functions:**

```go
// GetSubscriptionOrders retrieves all orders for a specific subscription
func GetSubscriptionOrders(c *gin.Context) {
	subscriptionID := c.Param("id")
	var orders []models.Order

	if err := database.DB.Where("subscription_id = ?", subscriptionID).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		middleware.ServerError(c, "Failed to fetch orders: "+err.Error())
		return
	}

	middleware.Success(c, orders)
}

// GetBasketOrders retrieves all orders for baskets owned by a seller
func GetBasketOrders(c *gin.Context) {
	basketID := c.Param("id")
	var orders []models.Order

	// Get all subscriptions for this basket, then get their orders
	if err := database.DB.Joins("JOIN subscriptions ON subscriptions.id = orders.subscription_id").
		Where("subscriptions.basket_id = ?", basketID).
		Preload("Subscription").
		Preload("Subscription.User").
		Preload("Subscription.Basket").
		Order("orders.created_at DESC").
		Find(&orders).Error; err != nil {
		middleware.ServerError(c, "Failed to fetch orders: "+err.Error())
		return
	}

	middleware.Success(c, orders)
}

// UpdateOrderStatusInput defines request structure for updating order status
type UpdateOrderStatusInput struct {
	Status       string `json:"status" binding:"required,oneof=preparing shipped delivered"`
	TrackingCode string `json:"tracking_code,omitempty"`
}

// UpdateOrderStatus updates the status of an order
func UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")
	var input UpdateOrderStatusInput

	if err := c.ShouldBindJSON(&input); err != nil {
		middleware.BadRequest(c, "Invalid status data", err.Error())
		return
	}

	var order models.Order
	if err := database.DB.First(&order, orderID).Error; err != nil {
		middleware.NotFound(c, "Order not found")
		return
	}

	// Update status
	order.Status = input.Status
	if input.TrackingCode != "" {
		order.TrackingCode = input.TrackingCode
	}

	// Set timestamps based on status
	now := time.Now()
	if input.Status == "shipped" && order.ShippedAt == nil {
		order.ShippedAt = &now
	}
	if input.Status == "delivered" && order.DeliveredAt == nil {
		order.DeliveredAt = &now
	}

	if err := database.DB.Save(&order).Error; err != nil {
		middleware.ServerError(c, "Failed to update order: "+err.Error())
		return
	}

	// Send notification
	go sendOrderNotification(order.SubscriptionID, input.Status)

	middleware.Success(c, order)
}

// GetOrder retrieves a single order by ID
func GetOrder(c *gin.Context) {
	orderID := c.Param("id")
	var order models.Order

	if err := database.DB.Preload("Subscription").
		Preload("Subscription.User").
		Preload("Subscription.Basket").
		First(&order, orderID).Error; err != nil {
		middleware.NotFound(c, "Order not found")
		return
	}

	middleware.Success(c, order)
}
```

---

### Task 1.6: Update Routes

**File:** [`internal/routes/routes.go`](../internal/routes/routes.go:1)

**Add new routes:**

```go
// Fix existing route
r.GET("/consumers/:id/subscriptions", controllers.GetConsumerSubscriptions)

// Add new order routes
r.GET("/subscriptions/:id/orders", controllers.GetSubscriptionOrders)
r.GET("/baskets/:id/orders", controllers.GetBasketOrders)
r.PUT("/orders/:id/status", controllers.UpdateOrderStatus)
r.GET("/orders/:id", controllers.GetOrder)
```

---

### Task 1.7: Remove Debug Code

**File:** [`internal/controllers/admin_controller.go`](../internal/controllers/admin_controller.go:1)

**Remove all `fmt.Printf` statements:**

```go
// Remove these lines:
// Line 23: fmt.Printf("Admin users request - Header X-User-ID: %s, Found %d users\n", userID, len(users))
// Line 40: fmt.Printf("Admin subscriptions request - Header X-User-ID: %s, Found %d subscriptions\n", userID, len(subscriptions))
// Line 57: fmt.Printf("Admin baskets request - Header X-User-ID: %s, Found %d baskets\n", userID, len(baskets))

// Optionally add proper logging if needed:
// log.Printf("Admin request: user_id=%s, resource=users, count=%d", userID, len(users))
```

---

## 🟢 Phase 2: Frontend Enhancements

### Task 2.1: Create Frontend Validators

**New File:** `frontend/src/utils/validators.js`

```javascript
/**
 * Validates Brazilian CPF
 * @param {string} cpf - CPF to validate
 * @returns {boolean} - True if valid
 */
export function validateCPF(cpf) {
  // Remove non-numeric characters
  cpf = cpf.replace(/\D/g, '');
  
  // Check length
  if (cpf.length !== 11) return false;
  
  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;
  
  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;
  
  // Verify
  return parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2;
}

/**
 * Validates Brazilian CNPJ
 * @param {string} cnpj - CNPJ to validate
 * @returns {boolean} - True if valid
 */
export function validateCNPJ(cnpj) {
  // Remove non-numeric characters
  cnpj = cnpj.replace(/\D/g, '');
  
  // Check length
  if (cnpj.length !== 14) return false;
  
  // Check for known invalid CNPJs
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Calculate first verification digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  // Calculate second verification digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  // Verify
  return parseInt(cnpj.charAt(12)) === digit1 && parseInt(cnpj.charAt(13)) === digit2;
}

/**
 * Formats CPF to XXX.XXX.XXX-XX
 * @param {string} cpf - CPF to format
 * @returns {string} - Formatted CPF
 */
export function formatCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formats CNPJ to XX.XXX.XXX/XXXX-XX
 * @param {string} cnpj - CNPJ to format
 * @returns {string} - Formatted CNPJ
 */
export function formatCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return cnpj;
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
```

---

### Task 2.2: Update Consumer Dashboard with Order Status

**File:** [`frontend/src/pages/ConsumerDashboard.jsx`](../frontend/src/pages/ConsumerDashboard.jsx:1)

**Replace entire file with:**

```javascript
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'

export default function ConsumerDashboard() {
  const [subscriptions, setSubscriptions] = useState([])
  const [orders, setOrders] = useState({}) // Store orders by subscription ID
  
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  
  useEffect(() => {
    if (!user || user.role !== 'consumer') {
      navigate('/')
      return
    }
    
    // Fetch consumer subscriptions
    axios.get(`http://localhost:8080/consumers/${user.ID}/subscriptions`)
      .then(res => {
        const subs = res.data.data || []
        setSubscriptions(subs)
        
        // Fetch orders for each subscription
        subs.forEach(sub => {
          axios.get(`http://localhost:8080/subscriptions/${sub.ID}/orders`)
            .then(orderRes => {
              setOrders(prev => ({
                ...prev,
                [sub.ID]: orderRes.data.data || []
              }))
            })
            .catch(console.error)
        })
      })
      .catch(console.error)
  }, [])
  
  const logout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  // Get the most recent order for a subscription
  const getLatestOrder = (subscriptionId) => {
    const subOrders = orders[subscriptionId]
    if (!subOrders || subOrders.length === 0) return null
    return subOrders[0] // Orders are sorted by created_at DESC
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'preparing': return '📦'
      case 'shipped': return '🚚'
      case 'delivered': return '✅'
      default: return '❓'
    }
  }

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'preparing': return t('order.preparing')
      case 'shipped': return t('order.shipped')
      case 'delivered': return t('order.delivered')
      default: return status
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen p-5 font-sans text-main-text">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase bg-gradient-secondary-tertiary text-transparent bg-clip-text">
            {t('consumer.title')}
          </h1>
          <p className="text-xs text-gray-400">{t('common.welcome', { name: user?.name })}</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => navigate('/config')} className="text-2xl" title={t('common.settings')}>⚙️</button>
          <button onClick={logout} className="text-xs text-red-400 font-bold underline self-center">
            {t('common.logout')}
          </button>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">{t('consumer.noActiveSubscriptions')}</p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => {
            const latestOrder = getLatestOrder(sub.ID)
            return (
              <div key={sub.ID} className="p-1 rounded-2xl bg-gradient-secondary-forth">
                <div className="bg-background p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-lg font-black uppercase text-main-text">{sub.basket.name}</h2>
                      <p className="text-sm text-gray-400">
                        {t('common.status')} <span className="text-green-400 font-bold">{sub.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-bold text-main-text">R$ {sub.basket.price}</span>
                      <span className="text-xs text-gray-500 uppercase">{sub.frequency}</span>
                    </div>
                  </div>
                  
                  {/* Order Status */}
                  {latestOrder && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getStatusIcon(latestOrder.status)}</span>
                          <div>
                            <p className="text-sm font-bold text-main-text">
                              {getStatusText(latestOrder.status)}
                            </p>
                            {latestOrder.tracking_code && (
                              <p className="text-xs text-gray-500">
                                {t('order.tracking')}: {latestOrder.tracking_code}
                              </p>
                            )}
                          </div>
                        </div>
                        {orders[sub.ID] && orders[sub.ID].length > 1 && (
                          <span className="text-xs text-gray-500">
                            +{orders[sub.ID].length - 1} {t('order.previousOrders')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

---

### Task 2.3: Create Seller Order Management Page

**New File:** `frontend/src/pages/SellerOrderManagement.jsx`

```javascript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { t } from '../i18n'
import Button from '../components/ui/Button'

export default function SellerOrderManagement() {
  const { basketId } = useParams()
  const navigate = useNavigate()
  const [basket, setBasket] = useState(null)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all') // all, preparing, shipped, delivered
  
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/')
      return
    }

    // Fetch basket details
    axios.get(`http://localhost:8080/baskets/${basketId}`)
      .then(res => setBasket(res.data.data))
      .catch(console.error)

    // Fetch orders for this basket
    fetchOrders()
  }, [basketId])

  const fetchOrders = () => {
    axios.get(`http://localhost:8080/baskets/${basketId}/orders`)
      .then(res => setOrders(res.data.data || []))
      .catch(console.error)
  }

  const updateOrderStatus = (orderId, newStatus) => {
    axios.put(`http://localhost:8080/orders/${orderId}/status`, {
      status: newStatus
    })
      .then(() => {
        alert(t('seller.orderStatusUpdated'))
        fetchOrders() // Refresh orders
      })
      .catch(err => {
        alert(t('seller.errorUpdatingOrder'))
        console.error(err)
      })
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  const getStatusColor = (status) => {
    switch(status) {
      case 'preparing': return 'bg-yellow-900 text-yellow-300'
      case 'shipped': return 'bg-blue-900 text-blue-300'
      case 'delivered': return 'bg-green-900 text-green-300'
      default: return 'bg-gray-900 text-gray-300'
    }
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen p-5 font-sans text-main-text">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate('/seller')} 
            className="text-secondary text-sm mb-2 hover:underline"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-black uppercase bg-gradient-secondary-tertiary text-transparent bg-clip-text">
            {basket?.name || t('seller.orderManagement')}
          </h1>
          <p className="text-xs text-gray-400">{t('seller.manageOrders')}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'preparing', 'shipped', 'delivered'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === status 
                ? 'bg-gradient-secondary-tertiary text-white' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            {t(`order.filter.${status}`)}
            <span className="ml-2 text-xs">
              ({status === 'all' ? orders.length : orders.filter(o => o.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">{t('seller.noOrders')}</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.ID} className="p-1 rounded-2xl bg-gradient-tertiary-forth">
              <div className="bg-background p-4 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-main-text">
                      {order.subscription?.user?.name || t('common.unknown')}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {t('order.orderId')}: #{order.ID}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.CreatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {t(`order.${order.status}`)}
                  </span>
                </div>

                {/* Customer Address */}
                {order.subscription?.user && (
                  <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{t('order.deliveryAddress')}</p>
                    <p className="text-sm text-main-text">
                      {order.subscription.user.address_street}, {order.subscription.user.address_number}
                    </p>
                    <p className="text-sm text-main-text">
                      {order.subscription.user.address_city}, {order.subscription.user.address_state}
                    </p>
                    <p className="text-sm