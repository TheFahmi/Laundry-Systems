/**
 * Get the authentication token from storage or session
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    // Try to get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Fetch data from an API with authentication token included
 * @param url The URL to fetch from
 * @param options Additional fetch options
 * @returns The fetch response
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Get the authentication token
  const token = await getAuthToken();
  
  // Add Authorization header if token exists
  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
    'Content-Type': 'application/json',
  };
  
  // Return the fetch with authorization headers included
  return fetch(url, {
    ...options,
    headers,
  });
} 