"use client";

import { useEffect, useState } from 'react';

export default function HtmlRenderer({ htmlContent }: { htmlContent: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // On the server and during hydration, render a placeholder with the same outer tags.
    // This empty div will match the server-rendered empty div, preventing mismatch.
    return <div className="prose dark:prose-invert max-w-full" />;
  }

  // On the client, after mounting, render the actual content.
  // This is safe from hydration errors.
  return (
    <div
      className="prose dark:prose-invert max-w-full"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
