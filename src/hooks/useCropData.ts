import { useState } from 'react';
import { api } from '../services/api';

export const useCropData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPrediction = async (params: {
    n: number;
    p: number;
    k: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getCropRecommendation(params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPrediction,
  };
};