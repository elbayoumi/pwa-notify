import { useEffect } from 'react';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Register the service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered with scope:', registration.scope);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  // Function to send a message
  const sendMessage = async (message) => {
    if (navigator.onLine) {
      // Send message directly if online
      await fetch('/send-message', {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Store message if offline
      storeMessage(message);
      // Register sync
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('sync-messages');
      });
    }
  };

  return <Component {...pageProps} />;
}
