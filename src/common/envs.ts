if (typeof import.meta.env.VITE_API_BASE_URL != 'string') throw new Error('API_BASE_URL is not a string');

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;