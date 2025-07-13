"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  // This effect runs only on the client, after the component has mounted.
  // This prevents the server from trying to access `window` and ensures
  // the initial render on both server and client are identical.
  React.useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check after mount
    checkDevice();

    // Add resize listener
    window.addEventListener("resize", checkDevice);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return isMobile;
}
