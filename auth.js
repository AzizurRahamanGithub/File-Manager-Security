// auth.js - Handles all authentication logic
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  sessionStorage.setItem('authToken', token); // Persist across page refreshes
}

export function getAuthToken() {
  if (!authToken) {
    authToken = sessionStorage.getItem('authToken');
  }
  return authToken;
}

export function getAuthHeader() {
  const token = getAuthToken();
  return token ? { 
    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs`,
    'Content-Type': 'application/json'
  } : {};
}

export function clearAuthToken() {
  authToken = null;
  sessionStorage.removeItem('authToken');
}