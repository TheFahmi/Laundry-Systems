import Cookies from 'js-cookie';

/**
 * Gets the JWT token from cookies or fallback sources
 * Ensures we always return the most recent token
 */
export const getToken = () => {
  // First try to get it from cookies (main storage)
  let token = Cookies.get('token');
  
  // If no token in cookies but we have a token in localStorage (backup), restore it
  if (!token && localStorage.getItem('token_backup')) {
    token = localStorage.getItem('token_backup');
    console.log('[Auth] Restored token from backup');
    
    // Save the restored token back to cookies
    Cookies.set('token', token, {
      expires: 30, // 30 days
      path: '/',
      sameSite: 'Lax'
    });
  }
  
  // Check if token is expired before returning it
  if (token) {
    try {
      // Decode token to check expiration
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Not a valid JWT token format
        console.error('[Auth] Invalid token format');
        return null;
      }
      
      // Parse payload
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      if (payload.exp && payload.exp < now) {
        console.log('[Auth] Token is expired, attempting regeneration');
        
        // Clear expired token
        Cookies.remove('token');
        localStorage.removeItem('token_backup');
        
        // Regeneration will happen on next API call when 401 is received
        return null;
      }
    } catch (error) {
      console.error('[Auth] Error checking token:', error);
      return null;
    }
  }
  
  return token || null;
};

/**
 * Decode and return the payload of a JWT token
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    return JSON.parse(atob(parts[1]));
  } catch (error) {
    console.error('[Auth] Error decoding token:', error);
    return null;
  }
};

/**
 * Get current user information from the token
 */
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  
  const payload = decodeToken(token);
  if (!payload) return null;
  
  return {
    id: payload.userId || payload.sub,
    username: payload.username,
    role: payload.role || 'user'
  };
};

// Export other auth functions
export default {
  getToken,
  decodeToken,
  getCurrentUser
}; 