/**
 * Client-side API fetcher function (for use in components with client-side data fetching)
 */
export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  // Use localhost:3000/api as the proxy endpoint
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const url = `${apiUrl}${endpoint}`;
  
  // Prepare headers with authentication
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  // Merge options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Include cookies in request
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle API error responses
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(error.message || 'API request failed');
    }
    
    // Parse response
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
} 