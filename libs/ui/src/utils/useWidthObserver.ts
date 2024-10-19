import { useEffect, useLayoutEffect, useState } from 'react';

export const useWidthObserver = (
  elementRef: React.RefObject<HTMLElement>,
  deps: any[] = [],
) => {
  const [width, setWidth] = useState(elementRef.current?.offsetWidth);
  const [height, setHeight] = useState(elementRef.current?.offsetHeight);

  useLayoutEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setWidth(rect.width);
      setHeight(rect.height);
    }
  }, [elementRef.current, ...deps]);

  useEffect(() => {
    // Use resize observer to watch graph container ref for size changes
    const resizeObserver = new ResizeObserver(() => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setWidth(rect.width);
        setHeight(rect.height);
      }
    });

    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef.current]);

  return {
    width,
    height,
  };
};
