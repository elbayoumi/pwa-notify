import { useEffect } from 'react';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return <Component {...pageProps} />;
}
