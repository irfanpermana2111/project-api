const API_BASE_URL = 'http://localhost:5000';

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    // Backend mengembalikan { status: 'success', data: [...] }
    const actualData = json.data !== undefined ? json.data : json;
    return { data: actualData, error: null };
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return { data: null, error };
  }
}
