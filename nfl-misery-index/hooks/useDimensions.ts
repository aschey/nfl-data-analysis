import { useState, useEffect } from 'react';

const getDimensionObject = (node: HTMLElement) => {
  return node.getBoundingClientRect();
};

export const useDimensions = (node: HTMLElement, liveMeasure = true): DOMRect | null => {
  const [dimensions, setDimensions] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!node) {
      return;
    }

    const measure = () => window.requestAnimationFrame(() => setDimensions(getDimensionObject(node)));
    measure();

    if (liveMeasure) {
      window.addEventListener('resize', measure);
      window.addEventListener('scroll', measure);

      return () => {
        window.removeEventListener('resize', measure);
        window.removeEventListener('scroll', measure);
      };
    }
  }, [node]);

  return dimensions;
};
