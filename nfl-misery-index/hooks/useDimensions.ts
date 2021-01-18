import { useState, useLayoutEffect, useRef } from "react";

export const useDimensions = <T>(data: T = null, liveMeasure = true) => {
  const [dimensions, setDimensions] = useState<number>(0);
  const node = useRef<HTMLElement>();

  useLayoutEffect(() => {
    const measure = () =>
      window.requestAnimationFrame(() => {
        setDimensions(node.current?.clientHeight ?? 0);
      });

    if (node) {
      measure();
      if (liveMeasure) {
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure);
      }
    }

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [node, liveMeasure, data]);

  return { dimensions, node };
};
