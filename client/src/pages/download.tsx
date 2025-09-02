import { useEffect } from "react";

export default function Download() {
  useEffect(() => {
    // Listen for a single message containing the blob URL or data URL
    const handler = (e: MessageEvent) => {
      try {
        if (!e.data) return;
        const { type, url, filename } = e.data || {};
        if (type !== 'save-cheetah-download' || !url) return;

        const a = document.createElement('a') as HTMLAnchorElement & { download?: string };
        if ('download' in a) {
          a.href = url;
          a.download = filename || 'share-card.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          // If it's an object URL, the opener should manage revoke
        } else {
          window.location.href = url; // Fallback navigation
        }

        // Close the tab shortly after to avoid leaving it open
        setTimeout(() => window.close(), 300);
      } catch {}
    };

    window.addEventListener('message', handler);
    // Notify opener that page is ready
    try { window.opener?.postMessage({ type: 'save-cheetah-download-ready' }, '*'); } catch {}

    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p>در حال آماده‌سازی دانلود...</p>
    </div>
  );
}


