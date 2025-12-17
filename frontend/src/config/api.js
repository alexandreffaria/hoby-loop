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
  
  // Admin endpoints
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_SUBSCRIPTIONS: `${API_BASE_URL}/admin/subscriptions`,
  ADMIN_BASKETS: `${API_BASE_URL}/admin/baskets`,
};

export default ENDPOINTS;