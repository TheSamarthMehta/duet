/**
 * The backend URL. Set EXPO_PUBLIC_API_URL in your .env / eas.json build profile.
 * Falls back to localhost for local development.
 *
 * IMPORTANT: after deploying to Railway, set EXPO_PUBLIC_API_URL to the public https URL
 * e.g. https://duet-production.up.railway.app  (this gets baked into the APK at build time)
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const API_BASE = `${API_URL}/api`;
// Socket.IO connects to the root host (not /api)
export const SOCKET_URL = API_URL;
