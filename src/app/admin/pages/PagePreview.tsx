
"use client";

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PagePreviewProps {
    htmlContent: string;
}

const PagePreview: React.FC<PagePreviewProps> = ({ htmlContent }) => {
    const [iframeBody, setIframeBody] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Create the full HTML document structure for the iframe
        const fullHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="/globals.css" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script>
                        tailwind.config = {
                            theme: {
                                extend: {
                                    colors: {
                                        background: 'hsl(var(--background))',
                                        foreground: 'hsl(var(--foreground))',
                                        card: {
                                        DEFAULT: 'hsl(var(--card))',
                                        foreground: 'hsl(var(--card-foreground))',
                                        },
                                        popover: {
                                        DEFAULT: 'hsl(var(--popover))',
                                        foreground: 'hsl(var(--popover-foreground))',
                                        },
                                        primary: {
                                        DEFAULT: 'hsl(var(--primary))',
                                        foreground: 'hsl(var(--primary-foreground))',
                                        },
                                        secondary: {
                                        DEFAULT: 'hsl(var(--secondary))',
                                        foreground: 'hsl(var(--secondary-foreground))',
                                        },
                                        muted: {
                                        DEFAULT: 'hsl(var(--muted))',
                                        foreground: 'hsl(var(--muted-foreground))',
                                        },
                                        accent: {
                                        DEFAULT: 'hsl(var(--accent))',
                                        foreground: 'hsl(var(--accent-foreground))',
                                        },
                                        destructive: {
                                        DEFAULT: 'hsl(var(--destructive))',
                                        foreground: 'hsl(var(--destructive-foreground))',
                                        },
                                        border: 'hsl(var(--border))',
                                        input: 'hsl(var(--input))',
                                        ring: 'hsl(var(--ring))',
                                    }
                                }
                            }
                        }
                    </script>
                    <style>
                        /* Minimal reset and body styles */
                        body {
                            background-color: hsl(var(--background));
                            color: hsl(var(--foreground));
                            font-family: sans-serif;
                            padding-top: 2rem;
                            padding-bottom: 2rem;
                        }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                </body>
            </html>
        `;
        setIframeBody(fullHtml);
        
        // A short delay to allow iframe to process the new content
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);

    }, [htmlContent]);

    return (
        <div className="w-full h-[60vh] border rounded-md overflow-hidden bg-muted/20">
            {isLoading && <Skeleton className="w-full h-full" />}
            <iframe
                srcDoc={iframeBody}
                title="Page Preview"
                className={`w-full h-full bg-background transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}

export default PagePreview;
