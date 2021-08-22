import React, { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
}

// from https://www.joshwcomeau.com/react/the-perils-of-rehydration/
export const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return undefined;
  }

  return <>{children}</>;
};
