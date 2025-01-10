import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'VEMO',
    description: 'Video Emotion Moment',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className="min-h-screen bg-gray-50" suppressHydrationWarning={true}>
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </body>
        </html>
    );
}
