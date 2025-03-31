/**
 * Utility functions for API requests
 */

/**
 * Get authorization token from browser cookies
 */
export function getAuthToken() {
  let token;
  
  if (typeof document !== 'undefined') {
    // Get auth token
    const tokenMatch = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    token = tokenMatch ? tokenMatch[2] : undefined;
    
    console.log(`ApiUtils: All cookies:`, document.cookie);
    console.log(`ApiUtils: Auth token exists: ${!!token}`);
  }
  
  return token;
}

/**
 * Create headers for API requests with auth token
 */
export function createAuthHeaders(contentType = 'application/json'): HeadersInit {
  const token = getAuthToken();
  
  const headers: HeadersInit = {};
  
  // Add content type if provided
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  // Add authorization token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('ApiUtils: Added Authorization header');
  } else {
    console.log('ApiUtils: No Authorization header added (token missing)');
  }
  
  console.log('ApiUtils: Final headers:', headers);
  return headers;
}

/**
 * Make an authenticated API request with proper headers
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = createAuthHeaders();
  
  // Merge provided headers with auth headers
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    },
    credentials: 'include' // Important for cookies
  };
  
  return fetch(url, mergedOptions);
} 