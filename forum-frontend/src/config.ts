// If in production (deployed), use the real backend URL.
// If in development (localhost), use localhost:8080.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";