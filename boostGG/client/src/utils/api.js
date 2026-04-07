// API Utility for frontend

// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Normalizes image URL to ensure it points to the backend server
 * @param {string} path - The image path from the database
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (path) => {
    if (!path) return null;

    // If it's already a full URL (Cloudinary or external), return as is
    if (path.startsWith('http')) {
        return path;
    }

    // Prepend API URL to local paths (e.g., /uploads/games/...)
    // Remove leading slash from path to avoid double slashes if API_URL has trailing slash
    // But API_URL usually doesn't, so we ensure one slash between them
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    return `${cleanApiUrl}/${cleanPath}`;
};
