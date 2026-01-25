/**
 * API configuration
 * 
 * This file contains all API related configuration.
 * Using a centralized config makes it easier to change
 * the API URL when deploying to different environments.
 */

// Base API URL
export const API_BASE_URL = 'http://localhost:8080';

// API endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  
  // Users
  UPDATE_USER: (userId) => `${API_BASE_URL}/users/${userId}`,
  
  // Baskets
  GET_BASKET: (basketId) => `${API_BASE_URL}/baskets/${basketId}`,
  CREATE_BASKET: `${API_BASE_URL}/baskets`,
  SELLER_BASKETS: (sellerId) => `${API_BASE_URL}/sellers/${sellerId}/baskets`,
  
  // Subscriptions
  CREATE_SUBSCRIPTION: `${API_BASE_URL}/subscriptions`,
  SELLER_SUBSCRIPTIONS: (sellerId) => `${API_BASE_URL}/sellers/${sellerId}/subscriptions`,
  USER_SUBSCRIPTIONS: (userId) => `${API_BASE_URL}/users/${userId}/subscriptions`,
  
  // Orders
  CREATE_ORDER: `${API_BASE_URL}/orders`,
  CONSUMER_ORDERS: (userId) => `${API_BASE_URL}/consumers/${userId}/orders`,
  SELLER_ORDERS: (sellerId) => `${API_BASE_URL}/sellers/${sellerId}/orders`,
  UPDATE_ORDER_STATUS: (orderId) => `${API_BASE_URL}/orders/${orderId}/status`,
  
  // Admin endpoints
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_SUBSCRIPTIONS: `${API_BASE_URL}/admin/subscriptions`,
  ADMIN_BASKETS: `${API_BASE_URL}/admin/baskets`,
  ADMIN_CREATE_BASKET: `${API_BASE_URL}/admin/baskets`,
};

/**
 * API Service Functions
 */

/**
 * Create a new basket (Admin only)
 * @param {Object} basketData - Basket data including seller_id, name, price, frequency
 * @param {string} userId - Admin user ID for authentication
 * @returns {Promise} Axios response promise
 */
export const createBasket = async (basketData, userId) => {
  const headers = { 'X-User-ID': userId };
  return await fetch(ENDPOINTS.ADMIN_CREATE_BASKET, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(basketData)
  });
};

/**
 * Get users by role
 * @param {string} role - User role to filter by (e.g., 'seller', 'consumer', 'admin')
 * @param {string} userId - User ID for authentication
 * @returns {Promise} Axios response promise
 */
export const getUsersByRole = async (role, userId) => {
  const headers = { 'X-User-ID': userId };
  const response = await fetch(ENDPOINTS.ADMIN_USERS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  const data = await response.json();
  const users = data.data || [];
  
  // Filter by role if specified
  if (role) {
    return users.filter(user => user.role === role);
  }
  
  return users;
};

/**
 * Get all orders for a consumer
 * @param {string} userId - Consumer user ID
 * @returns {Promise} Fetch response promise
 */
export const getConsumerOrders = async (userId) => {
  try {
    const response = await fetch(ENDPOINTS.CONSUMER_ORDERS(userId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch consumer orders');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching consumer orders:', error);
    throw error;
  }
};

/**
 * Get all orders for a seller (all baskets owned by the seller)
 * @param {string} sellerId - Seller user ID
 * @returns {Promise} Fetch response promise
 */
export const getSellerOrders = async (sellerId) => {
  try {
    const response = await fetch(ENDPOINTS.SELLER_ORDERS(sellerId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch seller orders');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status (preparing, shipped, delivered)
 * @param {string} trackingCode - Optional tracking code
 * @returns {Promise} Fetch response promise
 */
export const updateOrderStatus = async (orderId, status, trackingCode = '') => {
  try {
    const body = { status };
    if (trackingCode) {
      body.tracking_code = trackingCode;
    }

    const response = await fetch(ENDPOINTS.UPDATE_ORDER_STATUS(orderId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export default ENDPOINTS;