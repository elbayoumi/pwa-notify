import { useEffect } from 'react';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const enterFullscreen = () => {
      const element = document.documentElement; // استخدام عنصر HTML الأساسي
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
      }
    };

    // محاولة الدخول إلى وضع ملء الشاشة مباشرة
    const tryEnterFullscreen = async () => {
      // الانتظار لفترة قصيرة للتأكد من تحميل الصفحة
      await new Promise(resolve => setTimeout(resolve, 1000));
      enterFullscreen();
    };

    tryEnterFullscreen();

    // تسجيل Service Worker
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
