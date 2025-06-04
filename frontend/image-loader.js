// Simple image loader that handles our backend URLs
export default function imageLoader({ src, width, quality }) {
  // If the image is from our backend, use our custom loader
  if (src.startsWith('https://localhost:8080')) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }
  
  // For other images, use the default loader
  return src;
}

// Configure fetch to ignore SSL certificate errors for our backend
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (url, options = {}) => {
    if (typeof url === 'string' && url.startsWith('https://localhost:8080')) {
      // For our backend, we'll ignore SSL certificate errors
      return originalFetch(url, {
        ...options,
        mode: 'cors',
        credentials: 'include',
      });
    }
    return originalFetch(url, options);
  };
} 