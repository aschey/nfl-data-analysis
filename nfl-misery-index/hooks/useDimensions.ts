import { useState, useLayoutEffect, useRef, MutableRefObject } from "react";

export const useDimensions = <T>(
  data: T = null,
  liveMeasure = true,
): { dimensions: number; node: MutableRefObject<HTMLElement> } => {
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
