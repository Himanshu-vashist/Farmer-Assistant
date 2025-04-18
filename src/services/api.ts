import { authService } from './authService';

const BASE_URL = 'http://your-backend-url:8000';

const getHeaders = async () => {
  const token = await authService.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const api = {
  getCropRecommendation: async (params: {
    n: number;
    p: number;
    k: number;
    ph: float;
    city: string;
  }) => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}/soil-weather`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getChatResponse: async (text: string) => {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}/get-response`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  }
};
