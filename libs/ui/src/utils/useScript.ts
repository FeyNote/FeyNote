import { useEffect } from 'react';

export function useScript(url: string, onLoad?: () => void) {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;
    if (onLoad) script.onload = onLoad;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [url]);
}
