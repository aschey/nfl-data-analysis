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
// export const useDimensions = () => {
//   const ref = useRef<HTMLElement>();
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0, right: 0, bottom: 0 });
//   useLayoutEffect(() => {
//     setDimensions(ref.current.getBoundingClientRect());
//   }, [ref.current]);
//   console.log('test');
//   return { ref, dimensions };
// };
